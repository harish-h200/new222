import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import fs from 'fs';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// GET /api/questions - Fetch psychometric test questions
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        options: true
      },
      orderBy: {
        id: 'asc'
      }
    });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch psychometric questions' });
  }
});

// GET /api/skills - Fetch onboarding skills
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    res.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// GET /api/goals - Fetch problem statement goals
app.get('/api/goals', async (req, res) => {
  try {
    const goals = await prisma.goal.findMany();
    const mapped = goals.map(g => ({
      id: g.id,
      title: g.title,
      required_core_skills: g.requiredCoreSkills,
      description: g.description
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// GET /api/courses - Fetch all master courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await prisma.course.findMany();
    const mapped = courses.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      icon_type: c.iconType,
      duration_estimate: c.durationEstimate,
      academic_level: c.academicLevel,
      experience_level: c.experienceLevel,
      tags: c.tags
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/prerequisites - Fetch all course prerequisites
app.get('/api/prerequisites', async (req, res) => {
  try {
    const prerequisites = await prisma.coursePrerequisite.findMany();
    const mapped = prerequisites.map(p => ({
      course_id: p.courseId,
      prerequisite_course_id: p.prerequisiteCourseId,
      is_mandatory: p.isMandatory
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching prerequisites:', error);
    res.status(500).json({ error: 'Failed to fetch prerequisites' });
  }
});

// POST /api/users - Upsert user profile
app.post('/api/users', async (req, res) => {
  const { email, fullName, education, portfolio, reason, skills, academicLevel, experienceLevel } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        fullName,
        education,
        portfolio,
        reason,
        skills,
        academicLevel,
        experienceLevel
      },
      create: {
        email: normalizedEmail,
        fullName,
        education,
        portfolio,
        reason,
        skills,
        academicLevel,
        experienceLevel
      }
    });
    res.json(user);
  } catch (error) {
    console.error('Error upserting user:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// GET /api/users/:email - Fetch user by email (auto-creates skeleton if not exists)
app.get('/api/users/:email', async (req, res) => {
  const email = req.params.email.toLowerCase().trim();
  try {
    let user = await prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      // Auto-create skeleton user
      user = await prisma.user.create({
        data: {
          email,
          fullName: email.split('@')[0],
          skills: []
        }
      });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching/creating user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/roadmaps - Save generated roadmap with nodes and edges
app.post('/api/roadmaps', async (req, res) => {
  const { goalId, userId, email, userEmail, nodes, edges } = req.body;

  if (!goalId || !nodes || !edges) {
    return res.status(400).json({ error: 'Missing goalId, nodes, or edges' });
  }

  try {
    let resolvedUserId = userId;
    const targetEmail = (email || userEmail)?.toLowerCase().trim();
    if (!resolvedUserId && targetEmail) {
      const dbUser = await prisma.user.findUnique({
        where: { email: targetEmail }
      });
      if (dbUser) {
        resolvedUserId = dbUser.id;
      }
    }

    // 1. Create the roadmap in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const roadmap = await tx.roadmap.create({
        data: {
          goalId,
          userId: resolvedUserId || null
        }
      });

      // Map from frontend node ID (e.g. courseId or 'root') to the created db RoadmapNode id
      const dbNodeIdMap = {};

      // 2. Insert nodes
      const createdNodes = [];
      for (const node of nodes) {
        const createdNode = await tx.roadmapNode.create({
          data: {
            roadmapId: roadmap.id,
            courseId: node.courseId || null,
            customLabel: node.customLabel || null,
            nodeType: node.nodeType,
            positionX: node.positionX,
            positionY: node.positionY,
            status: node.status || 'unlocked'
          }
        });
        createdNodes.push(createdNode);
        dbNodeIdMap[node.id] = createdNode.id;
      }

      // 3. Insert edges
      const createdEdges = [];
      for (const edge of edges) {
        const dbSourceId = dbNodeIdMap[edge.sourceNodeId];
        const dbTargetId = dbNodeIdMap[edge.targetNodeId];

        if (dbSourceId && dbTargetId) {
          const createdEdge = await tx.roadmapEdge.create({
            data: {
              roadmapId: roadmap.id,
              sourceNodeId: dbSourceId,
              targetNodeId: dbTargetId,
              isAnimated: edge.isAnimated !== undefined ? edge.isAnimated : true
            }
          });
          createdEdges.push(createdEdge);
        }
      }

      return { roadmap, nodes: createdNodes, edges: createdEdges };
    });

    res.json(result);
  } catch (error) {
    console.error('Error saving roadmap:', error);
    try {
      fs.appendFileSync('error.log', `[${new Date().toISOString()}] Error saving roadmap: ${error.stack || error}\n`);
    } catch (fsErr) {
      console.error('FS log error:', fsErr);
    }
    res.status(500).json({ error: 'Failed to save roadmap', details: error.message });
  }
});

// GET /api/roadmaps/:id - Get roadmap with nodes and edges
app.get('/api/roadmaps/:id', async (req, res) => {
  try {
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: req.params.id },
      include: {
        goal: true,
        nodes: {
          include: {
            course: true
          }
        },
        edges: true
      }
    });

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    res.json(roadmap);
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
});

// GET /api/users/:email/roadmaps - Get all saved roadmaps for a user
app.get('/api/users/:email/roadmaps', async (req, res) => {
  const email = req.params.email.toLowerCase().trim();
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const roadmaps = await prisma.roadmap.findMany({
      where: { userId: user.id },
      include: {
        goal: true,
        nodes: {
          include: {
            course: true
          }
        },
        edges: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(roadmaps);
  } catch (error) {
    console.error('Error fetching user roadmaps:', error);
    res.status(500).json({ error: 'Failed to fetch user roadmaps' });
  }
});

// POST /api/test-results - Save test scores and auto-create domain allocations
app.post('/api/test-results', async (req, res) => {
  const { email, scores } = req.body;

  if (!email || !scores) {
    return res.status(400).json({ error: 'Missing email or scores' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has already taken the test
    const existingResult = await prisma.testResult.findFirst({
      where: { userId: user.id }
    });

    if (existingResult) {
      return res.status(400).json({ error: 'You have already completed the psychometric test. Retakes are not permitted.' });
    }

    // Save test results and allocations in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the test result record
      const testResult = await tx.testResult.create({
        data: {
          userId: user.id,
          scores: scores
        }
      });

      // 3. Determine recommended domains based on scores
      const sortedDomains = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const maxScore = sortedDomains[0][1];
      const recommendations = sortedDomains
        .filter(([_, score]) => score >= maxScore - 1)
        .map(([domain]) => domain);

      // Tailored reasons for allocation
      const reasonMapping = {
        'AI/ML': 'Allocated because you scored highest in algorithmic logic, machine learning curiosity, and system-level mathematical optimization questions.',
        'Backend': 'Allocated because you displayed excellent aptitude for database architecture, API designs, data normalization, and system backend optimization.',
        'Data': 'Allocated because you demonstrated key strengths in data pipeline analysis, database operations, scalability, and information pipeline construction.'
      };

      const defaultReason = 'Allocated based on your high alignment with complex problem solving, structured analysis, and engineering curiosity during the psychometric evaluation.';

      // 4. Create domain allocations
      const allocations = [];
      for (const domain of recommendations) {
        const reason = reasonMapping[domain] || defaultReason;
        const allocation = await tx.domainAllocation.create({
          data: {
            userId: user.id,
            domain: domain,
            reason: reason
          }
        });
        allocations.push(allocation);
      }

      return { testResult, allocations };
    });

    res.json(result);
  } catch (error) {
    console.error('Error saving test results:', error);
    res.status(500).json({ error: 'Failed to save test results' });
  }
});

// GET /api/users/:email/test-results - Fetch user's latest test results
app.get('/api/users/:email/test-results', async (req, res) => {
  const email = req.params.email.toLowerCase().trim();
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const results = await prisma.testResult.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(results);
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({ error: 'Failed to fetch test results' });
  }
});

// GET /api/users/:email/domain-allocations - Fetch user's domain allocations
app.get('/api/users/:email/domain-allocations', async (req, res) => {
  const email = req.params.email.toLowerCase().trim();
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const allocations = await prisma.domainAllocation.findMany({
      where: { userId: user.id },
      orderBy: { allocatedAt: 'desc' }
    });
    res.json(allocations);
  } catch (error) {
    console.error('Error fetching domain allocations:', error);
    res.status(500).json({ error: 'Failed to fetch domain allocations' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
