const GEMINI_MODEL = 'gemini-2.0-flash'

function extractTopic(prompt) {
  const topicMatch = prompt.match(/"([^"]+)"/) || prompt.match(/topic:\s*"([^"]+)"/) || prompt.match(/topic:\s*([^\n.]+)/)
  return topicMatch ? topicMatch[1].trim() : 'this topic'
}

function extractText(prompt) {
  const textMatch = prompt.match(/:([\s\S]*)/)
  return textMatch ? textMatch[1].trim().slice(0, 200) : 'the provided text'
}

function extractSubject(prompt) {
  const subMatch = prompt.match(/for\s+(.+?)\s+with/) || prompt.match(/for\s+(.+?)(?:\s+with|\s*$)/)
  return subMatch ? subMatch[1].trim() : 'your subject'
}

function generateDemo(prompt) {
  const topic = extractTopic(prompt)

  if (prompt.includes('Generate 5 flashcards')) {
    const topics = [topic, `${topic} fundamentals`, `${topic} applications`, `${topic} examples`, `${topic} key concepts`]
    const answers = [
      `The core idea of ${topic} involves understanding its fundamental principles and how they apply in real-world scenarios.`,
      `The fundamentals include key definitions, historical context, and the basic framework that supports advanced study.`,
      `Key applications range from practical industry use cases to research and development in cutting-edge fields.`,
      `Common examples illustrate how ${topic} concepts manifest in everyday situations and professional practice.`,
      `The key concepts form a mental model that helps in problem-solving and deeper comprehension of the subject.`
    ]
    return JSON.stringify(Array.from({ length: 5 }, (_, i) => ({
      front: topics[i], back: answers[i]
    })))
  }

  if (prompt.includes('Generate 5 multiple choice questions')) {
    const questions = [
      { question: `What is the primary focus of ${topic}?`, options: ['Theoretical analysis', 'Practical application', 'Both theory and practice', 'Neither'], correctIndex: 2 },
      { question: `Which of the following best describes ${topic}?`, options: ['A narrow field of study', 'An interdisciplinary area', 'A purely academic subject', 'A vocational skill'], correctIndex: 1 },
      { question: `What is a key prerequisite for studying ${topic}?`, options: ['Advanced mathematics', 'Basic foundational knowledge', 'Years of experience', 'No prerequisites'], correctIndex: 1 },
      { question: `How does ${topic} apply in the real world?`, options: ['It has limited applications', 'It is universally applicable', 'Only in research labs', 'Only in academic settings'], correctIndex: 1 },
      { question: `What skill is most important for mastering ${topic}?`, options: ['Memorization', 'Critical thinking', 'Speed reading', 'Note-taking'], correctIndex: 1 }
    ]
    return JSON.stringify(questions)
  }

  if (prompt.includes('comprehensive study notes')) {
    return `## Study Notes: ${topic}\n\n### Key Concepts\n\n**Definition**: ${topic} is a broad field encompassing fundamental principles, theories, and practical applications that form the foundation of the subject.\n\n**Importance**: Understanding ${topic} is crucial for academic progression and professional development in related fields.\n\n### Core Principles\n\n- **Foundation**: Built on established theories and proven methodologies\n- **Practice**: Requires consistent application and hands-on experience\n- **Integration**: Connects with multiple related disciplines\n\n### Examples\n\n1. **Academic Example**: Used in research papers and case studies\n2. **Practical Example**: Applied in real-world problem-solving scenarios\n3. **Industry Example**: Essential for modern professional practice\n\n### Summary\n\n${topic} is a comprehensive subject that combines theoretical knowledge with practical skills. Success requires dedication, consistent practice, and a curious mindset. Regular revision and application of concepts will lead to mastery.`
  }

  if (prompt.includes('Summarize the following text')) {
    return `## Summary\n\n**Key Points:**\n\n- The provided text discusses important concepts and ideas related to the subject matter\n- Main arguments are supported by evidence and logical reasoning\n- Several practical applications and implications are highlighted\n- The conclusion reinforces the central thesis\n\n**Core Takeaway:**\n\nThe material presents a comprehensive overview of the topic, emphasizing the connection between theory and practice. Understanding these concepts is essential for further study and application.`
  }

  if (prompt.includes('study plan')) {
    const sub = extractSubject(prompt)
    const hours = prompt.match(/(\d+)\s*hours?/)
    const h = hours ? parseInt(hours[1]) : 2
    return `## Study Plan: ${sub}\n\n**Total Time:** ${h} hours\n\n### Schedule Breakdown\n\n| Time Block | Duration | Activity |\n|---|---|---|\n| Week 1-2 | ${Math.round(h * 0.3)}h | Core concepts and fundamental theory |\n| Week 3-4 | ${Math.round(h * 0.25)}h | Practice problems and exercises |\n| Week 5-6 | ${Math.round(h * 0.25)}h | Advanced topics and application |\n| Week 7-8 | ${Math.round(h * 0.2)}h | Revision and mock tests |\n\n### Recommended Resources\n\n- **Textbooks**: Standard reference books for ${sub}\n- **Online**: Video lectures and interactive tutorials\n- **Practice**: Previous exam papers and problem sets\n\n### Study Tips\n\n1. Use active recall techniques\n2. Take short breaks every 25 minutes (Pomodoro)\n3. Form study groups for discussion\n4. Teach concepts to others for better retention`
  }

  if (prompt.includes('Answer this academic question')) {
    const q = extractText(prompt)
    return `## Answer\n\n**Question:** ${q.slice(0, 150)}\n\n### Step-by-Step Explanation\n\n1. **Understanding the Question**\n   First, identify the key components and what is being asked.\n\n2. **Core Concept**\n   This relates to fundamental principles of the subject area.\n\n3. **Breaking It Down**\n   Let's analyze each part systematically:\n   - Identify relevant formulas and theories\n   - Apply logical reasoning\n   - Consider alternative approaches\n\n4. **Solution**\n   Based on the analysis, the solution involves applying the core concepts correctly.\n\n### Key Takeaway\n\nPractice similar problems to reinforce understanding. Focus on the underlying principles rather than memorizing steps.`
  }

  if (prompt.includes('academic coach')) {
    return `## Academic Coach Advice\n\n**Goal:** ${topic}\n\n### Personalized Strategy\n\n**Short-term (This Week):**\n- Focus on understanding core fundamentals\n- Create a daily study schedule\n- Identify knowledge gaps\n\n**Mid-term (This Month):**\n- Build on concepts with consistent practice\n- Start working on application-based problems\n- Seek feedback from peers and mentors\n\n**Long-term (This Semester):**\n- Master the subject through comprehensive revision\n- Apply concepts in projects and real-world scenarios\n- Prepare for assessments with mock tests\n\n### Recommended Resources\n\n- **Books**: Key textbooks and reference materials\n- **Online Courses**: Structured video content and tutorials\n- **Practice Platforms**: Interactive problem-solving tools\n\n### Progress Tracking\n\n- Set weekly milestones with specific targets\n- Review progress every Sunday\n- Adjust strategy based on performance\n- Celebrate small wins to stay motivated!`
  }

  return `Here is information about "${topic}". ${topic} is an important subject that covers fundamental concepts, practical applications, and advanced topics. Regular study and practice are recommended for mastery.`
}

export async function callGemini(prompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    return { text: generateDemo(prompt), error: null, demo: true }
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      }
    )

    const body = await res.text()

    if (!res.ok) {
      let msg = `API error (${res.status})`
      try { const j = JSON.parse(body); msg = j.error?.message || msg } catch {}
      const isQuota = res.status === 429 || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('exhausted') || msg.toLowerCase().includes('limit')
      if (isQuota) {
        console.warn('Gemini API quota exceeded, using demo fallback:', msg)
        return { text: generateDemo(prompt), error: null, demo: true }
      }
      console.error('Gemini API error:', res.status, body)
      return { text: null, error: msg }
    }

    const data = JSON.parse(body)
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || null
    if (!text) return { text: generateDemo(prompt), error: null, demo: true }
    return { text, error: null, demo: false }
  } catch (err) {
    console.error('Gemini API call failed:', err)
    return { text: generateDemo(prompt), error: null, demo: true }
  }
}
