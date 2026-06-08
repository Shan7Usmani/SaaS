export function buildRoadmapPrompt(profile: {
  college?: string
  branch?: string
  current_year?: number
  cgpa?: number
  target_companies: string[]
  dsa_level?: string
  preferred_role?: string
}, targetCompany: string): string {
  return `Generate a 4-month placement preparation roadmap for a student targeting ${targetCompany}.

Student Profile:
${profile.college ? `- College: ${profile.college}` : ""}
${profile.branch ? `- Branch: ${profile.branch}` : ""}
${profile.current_year ? `- Year: ${profile.current_year}` : ""}
${profile.cgpa ? `- CGPA: ${profile.cgpa}` : ""}
${profile.dsa_level ? `- DSA Level: ${profile.dsa_level}` : ""}
${profile.preferred_role ? `- Target Role: ${profile.preferred_role}` : ""}
- Target Companies: ${profile.target_companies.join(", ")}

Return a JSON object with this structure:
{
  "months": [
    {
      "month": 1,
      "title": "string",
      "topics": [
        { "name": "string" }
      ]
    }
  ]
}

Each month should have 5-8 topics. Month 1 = foundations, Month 2 = core DSA, Month 3 = advanced topics, Month 4 = interview preparation. Tailor topics to the target company's known interview patterns.`
}

export const preBuiltRoadmaps: Record<string, { months: { month: number; title: string; topics: { name: string }[] }[] }> = {
  "Amazon SDE-1": {
    months: [
      { month: 1, title: "Foundations", topics: [
        { name: "Arrays & Hashing" }, { name: "Two Pointers" }, { name: "Sliding Window" },
        { name: "Binary Search" }, { name: "Time & Space Complexity" },
      ]},
      { month: 2, title: "Core Data Structures", topics: [
        { name: "Linked Lists" }, { name: "Stacks & Queues" }, { name: "Trees & BST" },
        { name: "Heaps & Priority Queues" }, { name: "HashMaps & Sets" },
      ]},
      { month: 3, title: "Advanced Topics", topics: [
        { name: "Graphs (BFS/DFS)" }, { name: "Dynamic Programming" }, { name: "Greedy Algorithms" },
        { name: "Backtracking" }, { name: "Tries" },
      ]},
      { month: 4, title: "Interview Prep", topics: [
        { name: "System Design Basics" }, { name: "CS Fundamentals" }, { name: "Mock Interviews" },
        { name: "Company-Specific Patterns" }, { name: "Behavioral Questions" },
      ]},
    ],
  },
  "Google SWE": {
    months: [
      { month: 1, title: "Foundations", topics: [
        { name: "Arrays & Strings" }, { name: "Hash Tables" }, { name: "Sorting & Searching" },
        { name: "Recursion" }, { name: "Math & Logic" },
      ]},
      { month: 2, title: "Data Structures", topics: [
        { name: "Trees & Graphs" }, { name: "Heaps" }, { name: "Tries" },
        { name: "Union-Find" }, { name: "Segment Trees" },
      ]},
      { month: 3, title: "Algorithms", topics: [
        { name: "Dynamic Programming" }, { name: "Greedy Algorithms" }, { name: "Graph Algorithms" },
        { name: "String Algorithms" }, { name: "Bit Manipulation" },
      ]},
      { month: 4, title: "Interview Prep", topics: [
        { name: "System Design" }, { name: "Googleyness Questions" }, { name: "Mock Interviews" },
        { name: "Coding Speed Practice" }, { name: "Behavioral Questions" },
      ]},
    ],
  },
}
