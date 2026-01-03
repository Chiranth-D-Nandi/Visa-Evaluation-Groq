import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Partner from '../models/Partner.js';
import Evaluation from '../models/Evaluation.js';

const router = express.Router();

// Middleware to verify API key
const verifyApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  try {
    const partner = await Partner.findOne({ apiKey, isActive: true });
    
    if (!partner) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    req.partner = partner;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Create new partner (admin only - in production, add admin auth)
router.post('/register', async (req, res) => {
  try {
    const { firmName, email, contactPerson, branding } = req.body;
    
    if (!firmName || !email) {
      return res.status(400).json({ error: 'Firm name and email required' });
    }
    
    // Generate unique API key
    const apiKey = `sk_${uuidv4().replace(/-/g, '')}`;
    
    const partner = new Partner({
      firmName,
      email,
      contactPerson,
      apiKey,
      branding: branding || {},
      stats: {
        totalEvaluations: 0,
        averageScore: 0
      }
    });
    
    await partner.save();
    
    res.json({
      message: 'Partner registered successfully',
      partnerId: partner._id,
      apiKey: partner.apiKey,
      partner: {
        firmName: partner.firmName,
        email: partner.email,
        branding: partner.branding
      }
    });
  } catch (error) {
    console.error('Partner registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Get partner details
router.get('/me', verifyApiKey, async (req, res) => {
  try {
    const partner = req.partner;
    
    res.json({
      partner: {
        id: partner._id,
        firmName: partner.firmName,
        email: partner.email,
        contactPerson: partner.contactPerson,
        branding: partner.branding,
        stats: partner.stats,
        createdAt: partner.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get partner leads (evaluations)
router.get('/leads', verifyApiKey, async (req, res) => {
  try {
    const { page = 1, limit = 20, country, visaType, minScore } = req.query;
    
    const query = { partnerId: req.partner._id };
    
    if (country) query.country = country;
    if (visaType) query.visaType = visaType;
    if (minScore) query.score = { $gte: parseInt(minScore) };
    
    const evaluations = await Evaluation.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-extractedData -confirmedData -documents'); // Exclude sensitive data
    
    const total = await Evaluation.countDocuments(query);
    
    // Calculate lead value (simple heuristic)
    const leadsWithValue = evaluations.map(evaluation => ({
      id: evaluation._id,
      name: evaluation.name,
      email: evaluation.email,
      country: evaluation.country,
      visaType: evaluation.visaType,
      score: evaluation.score,
      confidence: evaluation.confidence,
      createdAt: evaluation.createdAt,
      leadValue: calculateLeadValue(evaluation),
      urgency: calculateUrgency(evaluation)
    }));
    
    res.json({
      leads: leadsWithValue,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Leads fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch leads', details: error.message });
  }
});

// Get lead details
router.get('/leads/:id', verifyApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    
    const evaluation = await Evaluation.findOne({
      _id: id,
      partnerId: req.partner._id
    });
    
    if (!evaluation) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json({
      lead: {
        ...evaluation.toObject(),
        leadValue: calculateLeadValue(evaluation),
        urgency: calculateUrgency(evaluation)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get partner statistics
router.get('/stats', verifyApiKey, async (req, res) => {
  try {
    const partnerId = req.partner._id;
    
    const stats = await Evaluation.aggregate([
      { $match: { partnerId: partnerId.toString() } },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          averageScore: { $avg: '$score' },
          averageConfidence: { $avg: '$confidence' },
          highValueLeads: {
            $sum: { $cond: [{ $gte: ['$score', 70] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Breakdown by country
    const byCountry = await Evaluation.aggregate([
      { $match: { partnerId: partnerId.toString() } },
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      stats: stats[0] || { totalLeads: 0, averageScore: 0, averageConfidence: 0, highValueLeads: 0 },
      byCountry
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
  }
});

// Update partner branding
router.put('/branding', verifyApiKey, async (req, res) => {
  try {
    const { logo, primaryColor, headline } = req.body;
    
    const partner = req.partner;
    
    if (logo) partner.branding.logo = logo;
    if (primaryColor) partner.branding.primaryColor = primaryColor;
    if (headline) partner.branding.headline = headline;
    
    await partner.save();
    
    res.json({
      message: 'Branding updated successfully',
      branding: partner.branding
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update branding', details: error.message });
  }
});

// Helper functions

function calculateLeadValue(evaluation) {
  // Simple heuristic for lead value
  let value = 'Medium';
  
  if (evaluation.score >= 80 && evaluation.confidence >= 70) {
    value = 'High';
  } else if (evaluation.score >= 60 && evaluation.confidence >= 60) {
    value = 'Medium';
  } else {
    value = 'Low';
  }
  
  return value;
}

function calculateUrgency(evaluation) {
  // Check if evaluation is recent
  const daysSinceEval = (Date.now() - evaluation.createdAt) / (1000 * 60 * 60 * 24);
  
  if (daysSinceEval < 2 && evaluation.score >= 70) {
    return 'High';
  } else if (daysSinceEval < 7) {
    return 'Medium';
  }
  
  return 'Low';
}

export default router;
