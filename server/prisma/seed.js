import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MOCK_SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning',
  'Data Science', 'Aerodynamics', 'Finance Modeling', 'Blockchain',
  'UI/UX Design', 'Hardware IoT', 'Robotics'
];

const QUESTIONS = [
  {
    text: "When facing a complex problem, what excites you most?",
    options: [
      { text: "Building intelligent models that can learn and predict", domain: "AI/ML", weight: { "AI/ML": 2 } },
      { text: "Designing robust and scalable architectures", domain: "Backend", weight: { "Backend": 2 } },
      { text: "Structuring and processing massive amounts of information", domain: "Data", weight: { "Data": 2 } }
    ]
  },
  {
    text: "Which of these futuristic scenarios sounds most appealing as a career project?",
    options: [
      { text: "Developing a sentient AI assistant", domain: "AI/ML", weight: { "AI/ML": 2 } },
      { text: "Building the core infrastructure of the next fast global network", domain: "Backend", weight: { "Backend": 2 } },
      { text: "Creating a real-time global analytics pipeline", domain: "Data", weight: { "Data": 2 } }
    ]
  },
  {
    text: "In your free time, what kind of problems do you naturally gravitate towards?",
    options: [
      { text: "Experimenting with LLMs and new algorithms", domain: "AI/ML", weight: { "AI/ML": 2 } },
      { text: "Optimizing software and fixing system bottlenecks", domain: "Backend", weight: { "Backend": 2 } },
      { text: "Organizing files efficiently or writing scripts for automation", domain: "Data", weight: { "Data": 2 } },
      { text: "Training models on large datasets (AI + Data)", domain: "Cross", weight: { "AI/ML": 1, "Data": 1 } }
    ]
  },
  {
    text: "How do you prefer to validate your work?",
    options: [
      { text: "Checking accuracy, F1 scores, and model evaluations", domain: "AI/ML", weight: { "AI/ML": 1 } },
      { text: "Running load tests and system performance benchmarks", domain: "Backend", weight: { "Backend": 1 } },
      { text: "Verifying data integrity and pipeline throughput", domain: "Data", weight: { "Data": 1 } }
    ]
  }
];

const GOALS = [
  {
    id: "a1111111-1111-1111-1111-111111111111",
    title: 'Autonomous Swarm Satellites',
    requiredCoreSkills: ['AI/ML', 'python', 'machine-learning', 'system-design'],
    description: 'Develop AI algorithms to coordinate a massive swarm of nano-satellites for global internet coverage without collisions.'
  },
  {
    id: "a2222222-2222-2222-2222-222222222222",
    title: 'Automated Landing Rocket',
    requiredCoreSkills: ['Aero', 'python', 'system-design', 'algorithms'],
    description: 'Build the core control system for a reusable launch vehicle capable of pinpoint autonomous landing.'
  },
  {
    id: "a3333333-3333-3333-3333-333333333333",
    title: 'Real-time AI Market Predictor',
    requiredCoreSkills: ['AI/ML', 'python', 'deep-learning', 'statistics'],
    description: 'Create a deep learning model that ingests heterogeneous data streams to predict micro-fluctuations in global markets.'
  },
  {
    id: "a4444444-4444-4444-4444-444444444444",
    title: 'Quantum High-Frequency Trading Bot',
    requiredCoreSkills: ['Finance', 'system-design', 'algorithms'],
    description: 'Design a simulation of a trading system utilizing quantum algorithms to execute trades faster than the speed of light allows theoretically.'
  },
  {
    id: "a5555555-5555-5555-5555-555555555555",
    title: 'Cognitive Software Debugger',
    requiredCoreSkills: ['AI/ML', 'llm', 'rag', 'algorithms'],
    description: 'Engineer an AI that can autonomously review, understand, and rewrite legacy codebases of automated robotics.'
  },
  {
    id: "a6666666-6666-6666-6666-666666666666",
    title: 'Next-Gen Hypersonic Drone Propulsion',
    requiredCoreSkills: ['Aero', 'statistics'],
    description: 'Design the thermodynamic models and CAD for an air-breathing hypersonic propulsion engine.'
  },
  {
    id: "a7777777-7777-7777-7777-777777777777",
    title: 'Decentralized Space Commerce Ledger',
    requiredCoreSkills: ['Finance', 'Aero', 'backend', 'system-design'],
    description: 'Architect a blockchain network capable of handling interstellar financial transactions resilient to high latency and relativistic effects.'
  }
];

const COURSES = [
  { id: "c0000001-0000-0000-0000-000000000001", title: "Linear Algebra & Calculus II", iconType: "book", durationEstimate: "Month 1", academicLevel: "UG", experienceLevel: "ALL", tags: ["statistics", "machine-learning"] },
  { id: "c0000002-0000-0000-0000-000000000002", title: "Advanced Tensor Calculus", iconType: "book", durationEstimate: "Month 1", academicLevel: "PG", experienceLevel: "ALL", tags: ["statistics", "machine-learning"] },
  
  { id: "c0000003-0000-0000-0000-000000000003", title: "Data Structures & Algorithms", iconType: "code", durationEstimate: "Month 2", academicLevel: "UG", experienceLevel: "ALL", tags: ["algorithms", "backend"] },
  { id: "c0000004-0000-0000-0000-000000000004", title: "Distributed Systems Architecture", iconType: "code", durationEstimate: "Month 2", academicLevel: "PG", experienceLevel: "ALL", tags: ["algorithms", "system-design", "backend"] },
  
  { id: "c0000005-0000-0000-0000-000000000005", title: "Numerical Methods", iconType: "book", durationEstimate: "Month 3", academicLevel: "ALL", experienceLevel: "ALL", tags: ["statistics", "machine-learning", "python"] },
  { id: "c0000006-0000-0000-0000-000000000006", title: "Physics Engine Fundamentals", iconType: "layers", durationEstimate: "Month 3", academicLevel: "ALL", experienceLevel: "ALL", tags: ["Aero", "algorithms"] },
  
  { id: "c0000007-0000-0000-0000-000000000007", title: "Concurrency & Multi-threading", iconType: "code", durationEstimate: "Month 4", academicLevel: "ALL", experienceLevel: "ALL", tags: ["backend", "algorithms"] },
  { id: "c0000008-0000-0000-0000-000000000008", title: "Cloud Deployment", iconType: "layers", durationEstimate: "Month 4", academicLevel: "ALL", experienceLevel: "ALL", tags: ["backend", "system-design"] },
  
  { id: "c0000009-0000-0000-0000-000000000009", title: "AI/ML Model Training", iconType: "code", durationEstimate: "Month 5", academicLevel: "ALL", experienceLevel: "ALL", tags: ["AI/ML", "python", "machine-learning", "deep-learning"] },
  { id: "c0000010-0000-0000-0000-000000000010", title: "Hardware-Software Interfacing", iconType: "layers", durationEstimate: "Month 5", academicLevel: "ALL", experienceLevel: "ALL", tags: ["Aero", "system-design"] },
  { id: "c0000011-0000-0000-0000-000000000011", title: "Modern Natural Language Processing (LLMs & RAG)", iconType: "code", durationEstimate: "Month 6", academicLevel: "ALL", experienceLevel: "ALL", tags: ["AI/ML", "llm", "rag", "vector-db"] }
];

const PREREQS = [
  // Numerical Methods needs Linear Algebra or Advanced Tensor Calculus
  { courseId: "c0000005-0000-0000-0000-000000000005", prerequisiteCourseId: "c0000001-0000-0000-0000-000000000001" },
  { courseId: "c0000005-0000-0000-0000-000000000005", prerequisiteCourseId: "c0000002-0000-0000-0000-000000000002" },

  // Physics Engine Fundamentals needs Linear Algebra or Advanced Tensor Calculus
  { courseId: "c0000006-0000-0000-0000-000000000006", prerequisiteCourseId: "c0000001-0000-0000-0000-000000000001" },
  { courseId: "c0000006-0000-0000-0000-000000000006", prerequisiteCourseId: "c0000002-0000-0000-0000-000000000002" },

  // Concurrency & Multi-threading needs DSA or Distributed Systems
  { courseId: "c0000007-0000-0000-0000-000000000007", prerequisiteCourseId: "c0000003-0000-0000-0000-000000000003" },
  { courseId: "c0000007-0000-0000-0000-000000000007", prerequisiteCourseId: "c0000004-0000-0000-0000-000000000004" },

  // Cloud Deployment needs DSA or Distributed Systems
  { courseId: "c0000008-0000-0000-0000-000000000008", prerequisiteCourseId: "c0000003-0000-0000-0000-000000000003" },
  { courseId: "c0000008-0000-0000-0000-000000000008", prerequisiteCourseId: "c0000004-0000-0000-0000-000000000004" },

  // AI/ML Model Training needs Numerical Methods
  { courseId: "c0000009-0000-0000-0000-000000000009", prerequisiteCourseId: "c0000005-0000-0000-0000-000000000005" },

  // Hardware-Software Interfacing needs Physics Engine Fundamentals
  { courseId: "c0000010-0000-0000-0000-000000000010", prerequisiteCourseId: "c0000006-0000-0000-0000-000000000006" },

  // Modern NLP needs AI/ML Model Training
  { courseId: "c0000011-0000-0000-0000-000000000011", prerequisiteCourseId: "c0000009-0000-0000-0000-000000000009" }
];

async function main() {
  console.log('Seeding skills...');
  for (const name of MOCK_SKILLS) {
    await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  console.log('Seeding psychometric questions...');
  await prisma.option.deleteMany({});
  await prisma.question.deleteMany({});
  for (const q of QUESTIONS) {
    await prisma.question.create({
      data: {
        text: q.text,
        options: {
          create: q.options.map(opt => ({
            text: opt.text,
            domain: opt.domain,
            weight: opt.weight
          }))
        }
      }
    });
  }

  console.log('Seeding goals...');
  for (const g of GOALS) {
    await prisma.goal.upsert({
      where: { id: g.id },
      update: {
        title: g.title,
        requiredCoreSkills: g.requiredCoreSkills,
        description: g.description
      },
      create: {
        id: g.id,
        title: g.title,
        requiredCoreSkills: g.requiredCoreSkills,
        description: g.description
      }
    });
  }

  console.log('Seeding courses...');
  for (const c of COURSES) {
    await prisma.course.upsert({
      where: { id: c.id },
      update: {
        title: c.title,
        iconType: c.iconType,
        durationEstimate: c.durationEstimate,
        academicLevel: c.academicLevel,
        experienceLevel: c.experienceLevel,
        tags: c.tags
      },
      create: {
        id: c.id,
        title: c.title,
        iconType: c.iconType,
        durationEstimate: c.durationEstimate,
        academicLevel: c.academicLevel,
        experienceLevel: c.experienceLevel,
        tags: c.tags
      }
    });
  }

  console.log('Seeding course prerequisites...');
  await prisma.coursePrerequisite.deleteMany({});
  for (const p of PREREQS) {
    await prisma.coursePrerequisite.create({
      data: {
        courseId: p.courseId,
        prerequisiteCourseId: p.prerequisiteCourseId
      }
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
