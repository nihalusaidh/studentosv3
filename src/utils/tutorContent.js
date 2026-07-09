import { callGemini } from '../config/gemini'

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function generateDemoLesson(topic) {
  const t = topic.toLowerCase()
  const isPhysics = t.includes('force') || t.includes('motion') || t.includes('energy') || t.includes('law') || t.includes('newton') || t.includes('velocity') || t.includes('acceleration') || t.includes('gravity') || t.includes('momentum') || t.includes('work')
  const isMath = t.includes('equation') || t.includes('quadratic') || t.includes('calculus') || t.includes('derivative') || t.includes('integral') || t.includes('algebra') || t.includes('geometry') || t.includes('trigonometry') || t.includes('function') || t.includes('graph')
  const isChem = t.includes('chemistry') || t.includes('element') || t.includes('periodic') || t.includes('bond') || t.includes('reaction') || t.includes('atom') || t.includes('molecule') || t.includes('acid') || t.includes('base') || t.includes('compound')
  const isBio = t.includes('biology') || t.includes('cell') || t.includes('photosynthesis') || t.includes('dna') || t.includes('rna') || t.includes('protein') || t.includes('organism') || t.includes('evolution') || t.includes('ecosystem') || t.includes('respiration') || t.includes('mitosis') || t.includes('meiosis')

  const w = (text, x, y, size = 20, color = 'white') => ({ action: 'write', text, x, y, size, color })
  const line = (x1, y1, x2, y2, color = 'white', width = 2) => ({ action: 'line', x1, y1, x2, y2, color, width })
  const arrow = (x1, y1, x2, y2, color = 'white', label = '') => ({ action: 'arrow', x1, y1, x2, y2, color, label })
  const box = (x, y, w_, h_, color = 'white', label = '', style = '') => ({ action: 'box', x, y, w: w_, h: h_, color, label, style })
  const circle = (cx, cy, r, color = 'white', label = '') => ({ action: 'circle', cx, cy, r, color, label })
  const highlight = (x, y, width, height, color = 'yellow') => ({ action: 'highlight', x, y, width, height, color })
  const axes = (x, y, w_, h_, color = 'white') => ({ action: 'axes', x, y, w: w_, h: h_, color })
  const clear = () => ({ action: 'clear' })

  const sections = [
    {
      title: `Introduction to ${topic}`,
      narration: `Let's begin our lesson on ${topic}. This is a fascinating topic that forms the foundation of many advanced concepts. I'll explain it step by step with clear diagrams and examples.`,
      board: [clear(), w(`Topic: ${topic}`, 60, 40, 28, 'yellow'), w('Key Concepts Overview', 60, 90, 22, 'cyan'), w('Understanding the fundamentals is the first step', 60, 140, 18, 'white'), w('Let me break this down for you', 60, 180, 18, 'white'), highlight(60, 125, 400, 25, 'yellow'), w('Ready to dive deep?', 60, 240, 20, 'green')]
    },
    {
      title: 'Core Principles',
      narration: `The core principles behind ${topic} are built on established theories and practical observations. Let me draw this out for you to visualize how everything connects.`,
      board: [clear(), w('Core Principles', 60, 40, 26, 'yellow'), box(150, 120, 120, 70, 'cyan', 'Principle 1', 'fill'), arrow(280, 155, 400, 155, 'green', 'leads to'), box(410, 120, 120, 70, 'purple', 'Principle 2', 'fill'), arrow(300, 200, 300, 280, 'orange', 'applied in'), box(200, 290, 200, 60, 'white', 'Real Applications', 'fill'), w('Key: principles form the foundation', 60, 400, 18, 'white'), highlight(60, 390, 350, 25, 'yellow')]
    },
    {
      title: 'Visual Explanation',
      narration: `Here's a visual representation of how ${topic} works. Look at the diagram I'm drawing — it shows the relationship between the different components we just discussed.`,
      board: [clear(), w('Visual Breakdown', 60, 40, 26, 'yellow'), axes(80, 380, 300, 220, 'white'), w('Value', 360, 385, 14, 'white'), w('Time', 75, 160, 14, 'white'), circle(500, 200, 50, 'green', 'Start'), arrow(560, 200, 640, 200, 'cyan', 'process'), box(650, 170, 100, 60, 'orange', 'Output', 'fill'), w('As you can see, the trend shows growth', 60, 430, 18, 'cyan')]
    },
    {
      title: 'Practical Example',
      narration: `Let's look at a practical example to make this more concrete. I'll walk you through a step-by-step problem so you can see how these concepts apply in real situations.`,
      board: [clear(), w('Practical Example', 60, 40, 26, 'yellow'), w('Step 1: Identify the problem', 70, 100, 20, 'green'), w('Step 2: Apply core principles', 70, 150, 20, 'cyan'), w('Step 3: Calculate and verify', 70, 200, 20, 'orange'), w('Step 4: Check your answer', 70, 250, 20, 'purple'), arrow(80, 130, 350, 130, 'green'), arrow(80, 180, 350, 180, 'cyan'), arrow(80, 230, 350, 230, 'orange'), w('Example: $E = mc^2$', 120, 310, 24, 'yellow'), highlight(100, 300, 400, 35, 'yellow')]
    },
    {
      title: 'Key Takeaways',
      narration: `Let's summarize what we've learned about ${topic}. Remember these key points — they'll help you solve problems and build on this knowledge in future lessons.`,
      board: [clear(), w('Summary & Key Takeaways', 60, 40, 28, 'yellow'), w('1. Understand the core principles', 80, 110, 20, 'white'), w('2. Practice with examples', 80, 160, 20, 'cyan'), w('3. Connect to real applications', 80, 210, 20, 'green'), w('4. Review and test yourself', 80, 260, 20, 'orange'), line(60, 300, 500, 300, 'yellow', 1), w('"Practice makes perfect!"', 120, 340, 22, 'purple'), highlight(100, 95, 380, 180, 'yellow')]
    }
  ]

  if (isPhysics) {
    sections[1] = {
      title: `Newton's Laws Applied`,
      narration: `In physics, ${topic} can be understood through Newton's laws of motion. Let me draw a free-body diagram to show the forces acting on an object.`,
      board: [clear(), w('Forces & Motion', 60, 40, 26, 'yellow'), box(180, 200, 80, 60, 'white', 'Object', 'fill'), vector(220, 230, 220, 120, 'red', 'F = ma'), arrow(180, 220, 50, 220, 'cyan', 'Friction'), arrow(260, 220, 400, 220, 'green', 'Applied'), w('Net force determines acceleration', 60, 340, 20, 'cyan'), w('ΣF = ma', 60, 390, 26, 'yellow')]
    }
    sections[3] = {
      title: 'Problem Solving',
      narration: `Let's solve a physics problem step by step. We'll use the formulas we've learned to calculate the unknown quantities. Always start by identifying all given values.`,
      board: [clear(), w('Physics Problem', 60, 40, 26, 'yellow'), w('Given: m = 5 kg, F = 20 N', 60, 100, 20, 'white'), line(60, 125, 500, 125, 'blue', 1), w(`Step 1: Use Newton's 2nd Law`, 60, 160, 18, 'cyan'), w('F = ma → a = F/m', 100, 200, 22, 'yellow'), w('Step 2: Substitute values', 60, 250, 18, 'green'), w('a = 20 / 5 = 4 m/s²', 100, 290, 24, 'cyan'), highlight(90, 280, 280, 30, 'yellow'), w('Answer: The acceleration is 4 m/s²', 60, 360, 20, 'white')]
    }
  }

  if (isMath) {
    sections[1] = {
      title: 'Graphical Representation',
      narration: `Let's visualize ${topic} on a coordinate system. I'll draw the axes and plot the key points so you can see the relationship between variables.`,
      board: [clear(), w(`${topic} — Graph`, 60, 40, 26, 'yellow'), axes(80, 400, 350, 280, 'white'), circle(220, 320, 5, 'red', 'P(2,4)'), circle(320, 270, 5, 'green', 'Q(4,2)'), curve([{x:80,y:400},{x:160,y:340},{x:260,y:310},{x:360,y:290}], 'green', 'bold'), w('The curve shows the relationship', 60, 430, 18, 'cyan')]
    }
    sections[2] = {
      title: 'Formula Derivation',
      narration: `Now let's derive the key formula step by step. Pay attention to each step — the logic flows naturally once you understand the pattern.`,
      board: [clear(), w('Formula Derivation', 60, 40, 26, 'yellow'), w('Step 1: Start with the standard form', 60, 100, 18, 'white'), w('ax² + bx + c = 0', 120, 140, 24, 'cyan'), w('Step 2: Apply the quadratic formula', 60, 200, 18, 'white'), w('x = (-b ± √(b² - 4ac)) / 2a', 80, 250, 22, 'yellow'), highlight(70, 240, 420, 30, 'yellow'), w('The discriminant (Δ) determines roots', 60, 320, 18, 'green')]
    }
  }

  if (isChem) {
    sections[1] = {
      title: 'Molecular Structure',
      narration: `Let's draw the molecular structure to understand how atoms bond together. The arrangement of atoms determines the properties of the compound.`,
      board: [clear(), w('Molecular Structure', 60, 40, 26, 'yellow'), circle(250, 160, 30, 'red', 'O'), circle(350, 160, 30, 'blue', 'H'), circle(350, 240, 30, 'blue', 'H'), line(280, 160, 320, 160, 'white', 3), line(350, 190, 350, 210, 'white', 3), w('H₂O — Water Molecule', 150, 310, 22, 'cyan'), w('Bond angle: 104.5°', 180, 350, 18, 'yellow'), highlight(140, 300, 300, 30, 'yellow')]
    }
    sections[3] = {
      title: 'Reaction Equation',
      narration: `Chemical reactions follow the law of conservation of mass. Let's balance this equation to see how atoms rearrange during the reaction.`,
      board: [clear(), w('Balanced Equation', 60, 40, 26, 'yellow'), w('2H₂ + O₂ → 2H₂O', 100, 130, 28, 'cyan'), arrow(100, 180, 380, 180, 'green', 'combustion'), w('Reactants: 4H + 2O', 100, 250, 18, 'white'), w('Products: 4H + 2O ✓', 100, 290, 18, 'green'), highlight(90, 240, 300, 60, 'yellow'), w('Mass is conserved!', 160, 380, 22, 'orange')]
    }
  }

  if (isBio) {
    sections[1] = {
      title: 'Cellular Structure',
      narration: `Let's draw a diagram of the cell structure. Every living organism is made of cells, and understanding their components is essential for ${topic}.`,
      board: [clear(), w('Cell Structure', 60, 40, 26, 'yellow'), circle(300, 240, 100, 'green', 'Nucleus'), circle(300, 240, 70, 'cyan', 'DNA'), circle(300, 240, 160, 'white', 'Cell'), w('Mitochondria', 120, 150, 16, 'orange'), w('ER', 430, 180, 16, 'purple'), w('Cell Membrane', 200, 410, 16, 'white'), arrow(300, 150, 210, 170, 'orange'), arrow(300, 350, 350, 340, 'cyan')]
    }
    sections[3] = {
      title: 'Process Overview',
      narration: `Now let's look at the biological process step by step. Each stage builds on the previous one, creating a beautiful cascade of reactions.`,
      board: [clear(), w('Biological Process', 60, 40, 26, 'yellow'), box(120, 130, 130, 60, 'cyan', 'Input', 'fill'), arrow(260, 160, 350, 160, 'green', '→'), box(360, 130, 130, 60, 'orange', 'Process', 'fill'), arrow(500, 160, 560, 160, 'green', '→'), box(570, 130, 130, 60, 'purple', 'Output', 'fill'), w('Energy is produced', 120, 280, 18, 'cyan'), w('Waste products are released', 120, 320, 18, 'white')]
    }
  }

  return { sections, demo: true }
}

export async function generateLesson(topic, extra = '') {
  if (!topic.trim()) return { error: 'Please enter a topic' }

  const prompt = `You are an expert teacher creating an interactive blackboard lesson. Generate a structured lesson about "${topic}" ${extra}.

Format your response as a valid JSON array of sections. Each section is a step in the lesson that gets drawn on a dark blackboard (1920x1080 canvas coordinates). Keep text concise.

Each section object has:
{
  "title": "Section title (short, 3-6 words)",
  "narration": "What the AI says while teaching this section (2-4 sentences, conversational, like a real teacher)",
  "board": [
    // Array of drawing actions executed in order on the blackboard
    // Available action types:
    { "action": "clear", "duration": 200 },
    { "action": "write", "text": "Heading text", "x": 60, "y": 40, "size": 28, "color": "yellow" },
    { "action": "write", "text": "Body text line", "x": 60, "y": 80, "size": 20, "color": "white" },
    { "action": "write", "text": "Formula: F = ma", "x": 80, "y": 140, "size": 24, "color": "cyan" },
    { "action": "line", "x1": 60, "y1": 70, "x2": 500, "y2": 70, "color": "yellow", "width": 2 },
    { "action": "box", "x": 150, "y": 200, "w": 100, "h": 70, "color": "white", "label": "m", "style": "fill" },
    { "action": "arrow", "x1": 250, "y1": 235, "x2": 380, "y2": 235, "color": "cyan", "label": "F" },
    { "action": "circle", "cx": 300, "cy": 350, "r": 40, "color": "green", "label": "Object" },
    { "action": "highlight", "x": 60, "y": 300, "width": 300, "height": 30, "color": "yellow" },
    { "action": "axes", "x": 500, "y": 400, "w": 200, "h": 150, "color": "white" },
    { "action": "curve", "points": [{"x":500,"y":400},{"x":550,"y":350},{"x":600,"y":370},{"x":650,"y":300}], "color": "green", "style": "bold" },
    { "action": "vector", "x1": 200, "y1": 300, "x2": 200, "y2": 150, "color": "red", "label": "mg" },
    { "action": "erase", "x": 0, "y": 0, "w": 400, "h": 200 }
  ]
}

IMPORTANT RULES:
- Use x,y coordinates within 60-800 (x) and 40-500 (y) range
- First action of each section should typically be "clear" to wipe the board
- Write the section title in yellow, size 26-30 at the top
- Use simple drawings (boxes, arrows, circles) to illustrate concepts
- For physics: draw force arrows (vector), boxes for objects, axes for graphs
- For math: draw axes (action: "axes"), curves, formulas in cyan
- For chemistry: draw circles for atoms, lines for bonds, box for container
- For biology: use text with labels, draw circles for cells, arrows for processes
- Each section should have 4-10 board actions
- Use "highlight" sparingly to emphasize key formulas or conclusions
- After drawing a diagram, add a write action with an example or label near it
- Available colors: white, yellow, cyan, green, red, pink, orange, purple

Generate 4-8 sections that cover the topic progressively from basics to advanced.

Return ONLY the JSON array, no markdown fences or other text.`

  const result = await callGemini(prompt)

  if (result.error) {
    return generateDemoLesson(topic)
  }

  if (result.demo) {
    try {
      const cleaned = result.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      const sections = JSON.parse(cleaned)
      if (!Array.isArray(sections) || sections.length === 0) throw new Error('Invalid')
      return { sections, demo: true }
    } catch {
      return generateDemoLesson(topic)
    }
  }

  try {
    const cleaned = result.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const sections = JSON.parse(cleaned)
    if (!Array.isArray(sections) || sections.length === 0) throw new Error('Invalid lesson format')
    return { sections, demo: false }
  } catch {
    return generateDemoLesson(topic)
  }
}

export async function askDoubt(question, lessonContext) {
  const prompt = `You are a patient tutor. The student is learning about this topic and asked a doubt.

Current lesson context:
${lessonContext}

Student's doubt: "${question}"

Answer clearly and conversationally in 2-4 sentences. Use simple language and connect it back to the lesson. If relevant, suggest what to draw on the blackboard to help explain.

Return your answer as a JSON object:
{
  "answer": "Your clear, conversational answer here",
  "drawInstructions": [] // optional array of board actions similar to lesson board actions
}

Return ONLY the JSON.`

  const result = await callGemini(prompt)
  if (result.error) return { error: result.error }

  try {
    const cleaned = result.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const data = JSON.parse(cleaned)
    return { answer: data.answer, drawInstructions: data.drawInstructions || [], demo: result.demo }
  } catch {
    return { answer: result.text, drawInstructions: [], demo: result.demo }
  }
}

export async function extractTopicsFromPDF(text) {
  const prompt = `Extract the main topics/concepts from this text as a JSON array of strings (max 10 topics). Each topic should be short (2-6 words) and specific enough to generate a lesson about.

Text:
${text.slice(0, 8000)}

Return ONLY the JSON array, like: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law"]`

  const result = await callGemini(prompt)
  if (result.error) return { error: result.error, topics: ['Key concepts from document'] }

  try {
    const cleaned = result.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const topics = JSON.parse(cleaned)
    return { topics: Array.isArray(topics) ? topics.slice(0, 10) : ['Key concepts from document'], demo: result.demo }
  } catch {
    return { topics: ['Key concepts from document'], demo: result.demo }
  }
}
