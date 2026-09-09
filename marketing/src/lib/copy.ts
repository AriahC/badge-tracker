/** Central marketing copy — keep organization-specific wording editable here. */

export const site = {
  name: "Veya",
  title: "Veya — Big Adventures. Progress You Can See.",
  description:
    "Veya helps Girl Scout families organize badges and real-world progress in one beautiful place. Become a Founding Family for $1.",
  supportEmail: "hello@veya.family",
  disclosure:
    "Veya is an independent progress companion for Girl Scout families. It is not affiliated with or endorsed by Girl Scouts of the USA. Girl Scouts and related marks are the property of Girl Scouts of the USA.",
  gsDisclosure:
    "Veya is an independent progress companion and is not affiliated with or endorsed by Girl Scouts of the USA.",
  developmentStatus:
    "Veya is still in active development. Contribute from $1 — as much as you'd like. That $1 minimum gets early access once the app is available; we'll email the adult purchaser when the invitation is ready.",
  /** Product scope: GS-only now; architecture stays open for later audiences. */
  audienceNow: "Girl Scout families",
  audienceLater: "families everywhere",
};

export const navLinks = [
  { href: "/#why-veya", label: "Why Veya" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#for-families", label: "For Girl Scouts" },
  { href: "/#our-story", label: "Our Story" },
  { href: "/faq", label: "FAQ" },
] as const;

export const announcement =
  "Founding Families can join early access for $1 →";

export const hero = {
  eyebrow: "DISCOVER ✦ DO ✦ TRACK ✦ GROW",
  headline: "Big adventures. Progress you can see.",
  body: "Veya helps Girl Scout families organize badges and real-world progress in one beautiful place — so she always knows what she can explore next.",
  primaryCta: "Become a Founding Family — $1 →",
  secondaryCta: "See how Veya works",
  microcopy:
    "From $1 in SOL — contribute as much as you'd like. Early access when the app is available. Not a subscription. Parent or guardian checkout required.",
};

export const founderProof = {
  headline: "Dreamed up by girls. Built for the way children really learn.",
  body: "Veya began when two Girl Scout members wanted one joyful place to find badges, understand what came next, and see everything they had already accomplished. So they started building it.",
  annotation: "Big ideas start small.",
};

export const problem = {
  id: "why-veya",
  headline: "Growing happens everywhere. Progress should not get lost.",
  body: "Girl Scouts learn through badges, service, outdoors, STEM, creativity, and everyday life. But the plan is often in one place, the evidence in another, and the finished work forgotten in a pile of papers. Veya brings the Girl Scout journey together.",
  cards: [
    {
      title: "Know what's next",
      body: "Turn a badge into clear, manageable steps.",
      icon: "compass" as const,
    },
    {
      title: "Capture the journey",
      body: "Keep progress, notes, and proud moments together.",
      icon: "camera" as const,
    },
    {
      title: "See how much you've grown",
      body: "Look back across badges, skills, and completed adventures.",
      icon: "sprout" as const,
    },
  ],
};

export const productLoop = {
  id: "how-it-works",
  headline: 'From "What should I do?" to "Look what I did."',
  support: "A simple, joyful rhythm for Girl Scout badge work.",
  steps: [
    {
      n: 1,
      title: "Choose",
      body: "Find a badge for her level, or pick up something she is already working on.",
      icon: "compass" as const,
    },
    {
      n: 2,
      title: "Do",
      body: "Follow a clear path and keep official Girl Scout materials close when they are needed.",
      icon: "mountain" as const,
    },
    {
      n: 3,
      title: "Record",
      body: "Check off progress, add a reflection, and save the moments that mattered.",
      icon: "camera" as const,
    },
    {
      n: 4,
      title: "Celebrate",
      body: "See completed badges come together in a growing record of her adventures.",
      icon: "star" as const,
    },
  ],
  cta: "See Veya in action →",
};

export const forFamilies = {
  id: "for-families",
  headline: "Built for Girl Scout families — first and fully.",
  body: "Today Veya is for Girl Scouts: Daisy through Ambassador. It helps families organize badge progress while keeping official program materials where they belong — at the center of the experience.",
  uses: [
    "Daisy",
    "Brownie",
    "Junior",
    "Cadette",
    "Senior",
    "Ambassador",
  ],
  calloutTitle: "For Girl Scout families",
  calloutBody:
    "Find what you're working on, see a clear planning view, record your progress, and keep your official badge materials close at hand. Veya helps organize the journey; your official Girl Scout materials and leaders remain the authority for requirements and awards.",
};

export const vision = {
  headline: "Girl Scouts today. More adventures later.",
  body: "We are focused on making Girl Scout badge tracking beautiful and useful. Later, we hope to welcome more families and kinds of real-world learning — without losing what makes Veya special for Girl Scouts.",
  cards: [
    {
      title: "Girl Scout badges",
      body: "Keep requirements and progress organized by level.",
      comingLater: false,
    },
    {
      title: "Notebook & journal",
      body: "Save notes and celebrate what she finished.",
      comingLater: false,
    },
    {
      title: "More programs & adventures",
      body: "Open Veya to families beyond Girl Scouts.",
      comingLater: true,
    },
    {
      title: "Family goals",
      body: "Work toward something that matters together.",
      comingLater: true,
    },
  ],
};

export const trust = {
  headline: "Their progress belongs to your family.",
  body: "Veya is being built around parent-controlled accounts, private-by-default progress, and thoughtful use of data. We do not need to turn childhood into an advertising profile to make a wonderful product.",
  points: [
    "Parent or guardian owns the family account",
    "Children's progress private by default",
    "No behavioral advertising to children",
    "Straightforward access and deletion controls",
    "Payments on Solana — no card details stored by Veya",
  ],
};

export const offer = {
  id: "founding-family",
  eyebrow: "HELP SHAPE VEYA",
  headline: "Join the first Girl Scout families for $1.",
  body: "Veya is being built in the open with Girl Scout families who care about real-world learning. Contribute what you like in SOL — $1 minimum gets early access to the app once it's available, and you can give more to help us build.",
  includes: [
    "$1 minimum gets early access once the app is available",
    "Contribute as much as you'd like beyond that",
    "Founder updates sent to the adult purchaser",
    "Opportunities to test features and share feedback",
    "Optional Founding Family recognition inside Veya",
  ],
  cta: "Get Early Access from $1 →",
  microcopy:
    "From $1 in SOL — contribute as much as you'd like. Early access when available. Not a subscription. Parent or guardian checkout required.",
  refund:
    "If Veya cannot offer your family early access, your $1 will be refunded. Before launch, a parent may also request a refund at hello@veya.family.",
};

export const founderStory = {
  id: "our-story",
  headline: "Meet the girls behind Veya.",
  body: [
    "Veya started with a real Girl Scout problem: two sisters wanted a better way to choose badges, keep track of requirements, and remember everything they had done. With their mom's support, they began turning their idea into a product for other Girl Scout families.",
    "They are helping shape the adventures, illustrations, language, and experience — because girls deserve more than products designed about them. They deserve the chance to build.",
  ],
  annotation: "A kinder, brighter, more curious world — that's the goal.",
};

export const closing = {
  headline: "A brighter way to see her grow.",
  body: "Make the next badge easier to begin — and every accomplishment harder to forget.",
  cta: "Become a Founding Family — $1 →",
  microcopy: "One-time payment. No subscription.",
};

export const checkout = {
  title: "Founding Family Early Access",
  price: "From $1 · contribute any amount · paid in SOL",
  includes: [
    "$1 minimum gets early access once the app is available",
    "Contribute as much as you'd like",
    "Founder updates",
    "Opportunities to test Veya",
    "Opportunities to help shape what gets built next",
    "Optional Founding Family recognition",
  ],
  payCta: "Pay with Solana →",
  demoNote:
    "Contribute from $1 in SOL — as much as you'd like. Your $1 minimum gets early access once the app is available.",
  consents: [
    "I am a parent or guardian, or I am at least 18 years old.",
    "I understand this is a one-time contribution in SOL (minimum $1), and that early access comes once the app is available.",
    "I agree to the Early Access Terms and Privacy Policy.",
  ],
  marketingOptIn:
    "Send me occasional Veya stories, family learning ideas, and product news.",
};

export const welcome = {
  headline: "You're in!",
  body: "Thank you for helping us build Veya for Girl Scout families.",
  badgeLabel: "FOUNDING FAMILY · 2026",
  surveyQuestion: "What would your Girl Scout family most want help organizing?",
  surveyOptions: [
    "Badges by level",
    "Cookie season",
    "Service projects",
    "Outdoor adventures",
    "STEM & coding badges",
    "Notebook & memories",
    "Something else",
  ],
  referralHeadline: "Know another Girl Scout family who would love Veya?",
  referralBody: "Help us grow by sharing Veya with a friend.",
  shareText:
    "We're helping build Veya — a new app that helps Girl Scouts see everything they're learning, doing, and achieving. You can become a Founding Family for $1 too.",
};

export const faqItems = [
  {
    q: "What is Veya?",
    a: "Veya is an independent progress companion for Girl Scout families. It helps girls understand what they are working toward, record what they have done, and decide which badge to explore next.",
  },
  {
    q: "Who created Veya?",
    a: "Veya was conceived by two Girl Scout members who wanted a better way to track their own badge progress. They are building it with their mom and a small group of families, designers, developers, and creative tools.",
  },
  {
    q: "Is Veya an official Girl Scouts app?",
    a: "No. Veya is an independent progress companion created by Girl Scout members. It can help families organize their work, but official Girl Scout materials and leaders remain the authority for badge requirements and awards.",
  },
  {
    q: "Can Veya tell us whether a Girl Scout badge has been earned?",
    a: "Veya can show what a family has recorded and help organize progress. It does not officially certify or award Girl Scout badges. Families should use their official materials and normal troop or council process.",
  },
  {
    q: "Does Veya replace the badge booklet or official materials?",
    a: "No. Veya provides a clear planning and progress view designed to be used alongside the relevant official materials.",
  },
  {
    q: "Is Veya only for Girl Scouts?",
    a: "Yes — for now. Veya is built for Girl Scout families. Later we hope to welcome more people and kinds of real-world learning, while keeping Girl Scouts beautifully supported.",
  },
  {
    q: "What does the $1 include?",
    a: "Founding Family contributions start at $1 (paid in SOL), and you can contribute as much as you'd like. The $1 minimum gets early access to the app once it's available, plus founder updates for the adult purchaser and opportunities to test Veya and share feedback.",
  },
  {
    q: "How do I pay?",
    a: "Founding Family payments are Solana-only. Choose any amount from $1 up, then scan the Solana Pay QR with Phantom (or another Solana wallet) or connect a browser wallet. We confirm the transfer on-chain.",
  },
  {
    q: "Is the $1 a subscription?",
    a: "No. It is a one-time contribution in SOL. Any future optional paid plan will be described separately and will require a new, clear choice.",
  },
  {
    q: "When will we receive access?",
    a: "Veya is in active development. Your contribution of $1 or more gets early access once the app is available — we will email invitation details to the adult purchaser at that time.",
  },
  {
    q: "Is the $1 refundable?",
    a: "If Veya cannot offer your family early access, the contribution will be refunded. Before launch, a parent may request a refund by contacting hello@veya.family.",
  },
  {
    q: "Does my child purchase early access?",
    a: "No. A parent, guardian, or adult must complete checkout and manage the family account.",
  },
  {
    q: "How does Veya protect children?",
    a: "Veya is being designed around parent-controlled accounts, private-by-default progress, limited data collection, and no behavioral advertising to children. The Privacy Policy will explain exactly what information is used and why.",
  },
  {
    q: "Will Veya always cost $1?",
    a: "The $1 minimum is for the Founding Family early-access offer — you may contribute more. Veya may offer free or paid plans later, but joining early access does not enroll a family in a subscription.",
  },
] as const;
