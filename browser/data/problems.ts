export type Problem = {
  id: string;
  title: string;
  difficulty: string;
  timeLimit: string;
  description: string;
  starterCode: string;
  tests: { name: string; input: string; output: string }[];
};

export const problems: Problem[] = [
  {
    id: "echo-squared",
    title: "Square the Sequence",
    difficulty: "Easy",
    timeLimit: "1s",
    description: `
Given an integer \`n\`, write a function that returns a list where each number is squared.

## Input Format
- First line: integer \`n\` (count of numbers)
- Second line: \`n\` integers

## Output Format
- A single line of \`n\` integers (squared)

## Example

**Input**
\`\`\`
4
1 2 3 4
\`\`\`

**Output**
\`\`\`
1 4 9 16
\`\`\`

## Constraints
- \`1 \\leq n \\leq 10^5\`
- \`-10^4 \\leq \\text{value} \\leq 10^4\`
    `.trim(),
    starterCode: `def solve(data: str) -> str:
    parts = data.strip().split()
    if not parts:
        return ""
    n = int(parts[0])
    nums = list(map(int, parts[1:1 + n]))
    out = [str(x * x) for x in nums]
    return " ".join(out)

if __name__ == "__main__":
    import sys
    data = sys.stdin.read()
    print(solve(data))
`,
    tests: [
      {
        name: "Sample",
        input: "4\n1 2 3 4\n",
        output: "1 4 9 16",
      },
      {
        name: "Zeros",
        input: "3\n0 0 0\n",
        output: "0 0 0",
      },
      {
        name: "Mixed",
        input: "5\n-2 -1 0 3 7\n",
        output: "4 1 0 9 49",
      },
    ],
  },
  {
    id: "pair-sum",
    title: "Closest Pair Sum",
    difficulty: "Medium",
    timeLimit: "1s",
    description: `
Given an array of integers and a target value, find the pair whose sum is closest to the target. Return the closest sum value.

## Input Format
- First line: \`n target\`
- Second line: \`n\` integers

## Output Format
- A single line with the closest sum value

## Example

**Input**
\`\`\`
4 10
1 2 7 8
\`\`\`

**Output**
\`\`\`
9
\`\`\`

## Constraints
- \`2 \\leq n \\leq 10^5\`
- \`-10^4 \\leq \\text{value} \\leq 10^4\`
- \`-10^6 \\leq \\text{target} \\leq 10^6\`
    `.trim(),
    starterCode: `def solve(data: str) -> str:
    parts = data.strip().split()
    if not parts:
        return ""
    n = int(parts[0])
    target = int(parts[1])
    nums = list(map(int, parts[2:2 + n]))
    nums.sort()
    left, right = 0, n - 1
    best = nums[left] + nums[right]
    while left < right:
        s = nums[left] + nums[right]
        if abs(s - target) < abs(best - target):
            best = s
        if s < target:
            left += 1
        elif s > target:
            right -= 1
        else:
            return str(s)
    return str(best)

if __name__ == "__main__":
    import sys
    print(solve(sys.stdin.read()))
`,
    tests: [
      {
        name: "Sample",
        input: "4 10\n1 2 7 8\n",
        output: "9",
      },
      {
        name: "Exact",
        input: "5 6\n-1 2 4 8 10\n",
        output: "6",
      },
      {
        name: "Negative",
        input: "4 -7\n-8 -5 -1 2\n",
        output: "-6",
      },
    ],
  },
];
