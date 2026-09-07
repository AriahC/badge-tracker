# Veya Founding Family Website — Build Guide

**Version:** 1.0  
**Date:** September 7, 2026  
**Purpose:** Implementation guide for agents building the Veya $1 Founding Family acquisition funnel.

---

## 1. Primary objective

Build a warm, high-trust, conversion-focused website that turns interested parents into **paid Veya Founding Families for $1**.

Do **not** present this externally as a generic “waitlist.” The user-facing concept is **Founding Family Early Access**.

The desired parent reaction is:

> My child will actually enjoy using this — and for $1, I want our family to help shape it.

### Primary conversion

`Become a Founding Family — $1`

This is a **one-time early-access purchase**, not a subscription.

### Secondary conversion

`See how Veya works`

This should scroll to or open the product experience section rather than compete with the paid CTA.

---

## 2. Funnel architecture

The website should move through this psychological sequence:

1. **Recognition** — “This solves a problem I actually have.”
2. **Desire** — “My child would enjoy using this.”
3. **Understanding** — “I can immediately see how it works.”
4. **Trust** — “This was thoughtfully made for families.”
5. **Belonging** — “I want to be one of the first families.”
6. **Commitment** — Pay $1.
7. **Activation** — Answer one optional segmentation question.
8. **Referral** — Invite another family.

Do not send cold visitors directly to a payment form. The landing page must earn the conversion first.

---

## 3. Visual design direction

### Overall aesthetic

The site should feel like:

- a beautiful field journal,
- a modern family app,
- a nature study notebook,
- a passport full of future adventures,
- intelligent enough for parents,
- magical enough that a child wants to tap it.

Avoid the visual language of:

- enterprise SaaS,
- crypto/web3,
- banking dashboards,
- school administration software,
- “mom blog” pastels,
- overly childish cartoons.

### Core visual language

- warm cream page background
- deep forest green typography and CTAs
- muted sage panels
- subtle golden accents
- restrained coral/orange accents inside product artwork
- botanical line art
- hand-drawn travel/nature annotations
- documentary-style family/adventure imagery
- rounded cards with fine warm-gray borders
- editorial serif headlines + clean humanist sans body type

### Suggested color tokens

These are implementation approximations; agents may tune against the supplied mockups.

```css
--veya-cream: #F8F4EA;
--veya-paper: #FFFDF7;
--veya-forest: #174B32;
--veya-forest-dark: #0C3827;
--veya-sage: #DDE7D5;
--veya-sage-light: #EEF3E8;
--veya-gold: #C79532;
--veya-gold-light: #F1D89D;
--veya-coral: #E67855;
--veya-ink: #17231C;
--veya-muted: #657067;
--veya-border: #DDD7C9;
```

### Typography

Recommended web-safe direction:

- **Display / editorial serif:** Fraunces, Cormorant Garamond, or similar.
- **Body / interface:** Inter, DM Sans, Avenir-style sans, or similar.
- **Handwritten accent:** use sparingly and only for decorative notes. Never use it for required information, legal text, pricing, forms, or primary CTAs.

Typography hierarchy:

- H1 desktop: 64–76px / 0.95–1.05 line-height
- H1 mobile: 42–50px
- H2 desktop: 40–52px
- H2 mobile: 30–36px
- Body desktop: 17–19px
- Body mobile: 16–18px
- Small trust/legal text: 12–14px; never below accessible minimums

---

## 4. Global page chrome

### Announcement bar

Sticky at top initially.

**Copy:**

> Founding Families can join early access for $1 →

Behavior:

- click scrolls to the Founding Family offer
- do not open checkout immediately
- dark green background
- cream/white text

### Navigation

Desktop:

- Veya logo
- Why Veya
- How It Works
- For Families
- Our Story
- FAQ
- `Get Early Access — $1` button

Mobile:

- Veya logo left
- hamburger right
- after the user scrolls past hero, show a sticky bottom or header CTA: `Early Access — $1`

---

## 5. Homepage sections

## Section 01 — Hero

### Eyebrow

`DISCOVER ✦ DO ✦ TRACK ✦ GROW`

### Headline

# Big adventures. Progress you can see.

### Body

Veya helps families organize badges, skills, projects, and real-world learning in one beautiful place — so children always know what they can explore next.

### Primary CTA

`Become a Founding Family — $1 →`

### Secondary CTA

`See how Veya works`

### Required microcopy

`One-time early-access payment. Not a subscription. Parent or guardian checkout required.`

### Hero visual

Use 2 overlapping Veya phone screens over an illustrated/photo nature landscape.

Preferred supplied references:

- `assets/app-screen-home.png`
- `assets/app-screen-badge.png`
- `assets/app-screen-notebook.png`
- `assets/app-screen-journal.png`

Do not use official Girl Scouts logos or official badge art.

### Conversion behavior

Primary CTA should scroll to an offer explainer or open a **Founding Family offer drawer/modal** that explains what $1 includes before collecting payment.

---

## Section 02 — Founder proof

### Headline

# Dreamed up by girls. Built for the way children really learn.

### Body

Veya began when two Girl Scout members wanted one joyful place to find badges, understand what came next, and see everything they had already accomplished. So they started building it.

Visual treatment:

- warm paper card
- documentary-style founder/family photo or illustration
- small handwritten annotation such as “Big ideas start small.”

Important: do not fabricate quotes. Use the founders’ real words if a quote is added.

---

## Section 03 — Problem / parent recognition

### Headline

# Growing happens everywhere. Progress should not get lost.

### Body

Children learn through projects, badges, service, travel, nature, creativity, and everyday life. But the plan is often in one place, the evidence in another, and the finished work forgotten in a pile of papers. Veya brings the journey together.

### Three cards

**Know what’s next**  
Turn a big goal into clear, manageable steps.

**Capture the journey**  
Keep progress, notes, and proud moments together.

**See how much you’ve grown**  
Look back across skills, interests, and completed adventures.

Use simple illustrated icon circles: compass/map, camera, leaf/growth.

---

## Section 04 — Product experience

### Headline

# From “What should I do?” to “Look what I did.”

### Supporting line

A simple, joyful rhythm for real-world learning.

### Four-step horizontal flow

1. **Choose** — Explore an interest, find an achievement, or add something your family is already working toward.
2. **Do** — Follow a clear path and complete the real-world activity.
3. **Record** — Add progress, notes, photos, or a reflection.
4. **Celebrate** — Watch completed adventures become a growing record of real-world learning.

Desktop: 4 columns connected by a subtle dotted/arrow path.  
Mobile: stacked or horizontally swipeable cards.

CTA beneath:

`See Veya in action →`

This can open a lightweight product-demo modal or scroll to screenshots.

---

## Section 05 — For real family life

### Headline

# Made to work with the adventures your family already loves.

Show use-case icons/cards for:

- Girl Scout badge tracking
- homeschool learning
- travel & worldschooling
- arts / making
- service & community
- life skills
- family goals

### Girl Scout callout

**For Girl Scout families**

Veya helps families organize progress toward badges and achievements while keeping official program materials where they belong: at the center of the experience.

Small quiet disclosure:

`Veya is an independent progress companion and is not affiliated with or endorsed by Girl Scouts of the USA.`

Do not use Girl Scouts logos, official badge artwork, uniform insignia, or wording that implies endorsement.

---

## Section 06 — Broader vision

### Headline

# One childhood. A thousand ways to grow.

Feature cards:

- **Badges and achievements** — Keep requirements and progress organized.
- **Original adventures** — Discover meaningful things to try in the real world.
- **Private learning record** — See interests and skills grow over time.
- **Family goals** — Work toward something that matters together.

Any feature not yet available must be labeled `Coming later`.

---

## Section 07 — Trust / privacy

### Headline

# Their progress belongs to your family.

### Body

Veya is being built around parent-controlled accounts, private-by-default progress, and thoughtful use of data.

Trust row:

- Parent or guardian owns the family account
- Children’s progress private by default
- No behavioral advertising to children
- Straightforward access and deletion controls
- Card information handled by payment provider

Do not claim “we collect no data” unless technically verified.

---

## Section 08 — Founding Family offer

This is the primary conversion block and should feel visually special.

### Eyebrow

`HELP SHAPE VEYA`

### Headline

# Join the first families for $1.

### Body

Veya is being built in the open with children and parents who care about real-world learning. Your one-time $1 Founding Family pass reserves early access and gives your family opportunities to help make Veya better.

### Includes

- Priority invitation to the relevant early-access release
- Founder updates sent to the adult purchaser
- Opportunities to test features and share feedback
- Optional Founding Family recognition inside Veya

### CTA

`Get Early Access for $1 →`

### Microcopy

`$1 once. Not a subscription. Parent or guardian checkout required.`

### Development timing

If no honest launch estimate exists, use:

> Veya is still in active development. We will email adult purchasers with progress and early-access timing as it becomes available.

### Refund copy

If Veya cannot offer the family early access, refund the $1. Before publication, replace support-email placeholders and verify the real process.

---

## Section 09 — Founder story

### Headline

# Meet the girls behind Veya.

### Body

Veya started with a real problem: two sisters wanted a better way to choose badges, keep track of requirements, and remember everything they had done. With their mom’s support, they began turning their idea into a product for other families.

They are helping shape the adventures, illustrations, language, and experience — because children deserve more than products designed about them. They deserve the chance to build.

Optional CTA: `Follow the build`

Do not publish names, ages, school, location, troop information, or identifying details without deliberate parental approval.

---

## Section 10 — Closing conversion

Use scenic mountain / world-travel art with a darker green overlay or illustrated landscape.

### Headline

# A brighter way to see them grow.

### Body

Make the next adventure easier to begin — and every accomplishment harder to forget.

### CTA

`Become a Founding Family — $1 →`

Microcopy: `One-time payment. No subscription.`

---

## Section 11 — Footer

Links:

- Why Veya
- How It Works
- Our Story
- FAQ
- Privacy
- Terms
- Refunds
- Contact
- Parent Support

Footer disclosure:

> Veya is an independent family learning and progress platform. References to third-party programs identify compatibility and do not imply affiliation or endorsement. Girl Scouts and related marks are the property of Girl Scouts of the USA.

Have counsel verify preferred trademark wording before launch.

---

# 6. Checkout flow

Build checkout as either:

- dedicated `/founding-family` page, or
- focused full-height modal/drawer that behaves like a page on mobile.

Do not use a tiny generic payment modal.

## Checkout Step 1 — Offer review

Display before payment fields:

**Founding Family Early Access**  
**$1 one-time payment**

Includes:

- priority early access
- founder updates
- opportunities to test Veya
- opportunities to help shape what gets built next
- optional Founding Family recognition

Explicitly state development status.

## Checkout Step 2 — Adult information

Collect only what is needed:

- adult purchaser email
- adult purchaser name if payment processor requires it
- billing country/location if required
- payment details directly through payment provider

Do **not** collect:

- child name
- birthday
- troop number
- school
- precise location
- badge progress
- child photograph

## Checkout Step 3 — Required acknowledgements

Unchecked boxes:

- `I am a parent or guardian, or I am at least 18 years old.`
- `I understand this is a one-time $1 early-access purchase and Veya is still in development.`
- `I agree to the Early Access Terms and Privacy Policy.`

Optional marketing consent must be separate and must not block purchase.

## Checkout Step 4 — Payment

Primary button:

`Pay $1 & Join →`

Prefer Apple Pay / Google Pay / Link / card through a PCI-compliant payment provider such as Stripe.

Do not implement recurring billing for this purchase.

---

# 7. Confirmation / activation page

Route example: `/welcome/founding-family`

### Hero

# You’re in! 🎉

> Thank you for helping us build Veya.

If a reliable sequential ID system exists, show:

`Founding Family #00127`

Otherwise use:

`FOUNDING FAMILY · 2026`

Do not invent a live count.

## Optional one-question segmentation survey

Question:

**What would your family most want Veya to help organize?**

Options:

- Badges
- Homeschool / learning
- Travel & worldschooling
- Service
- Financial literacy
- Family goals
- Something else

Allow one or multiple selections depending on analytics needs. Make it skippable.

## Referral CTA

### Headline

# Know another family who would love Veya?

Body:

Help us grow by sharing Veya with a friend.

Button:

`Share Veya ↗`

Generate a shareable URL containing a referral code if the referral system is live.

Suggested share text:

> We’re helping build Veya 🌱 — a new app that helps kids see everything they’re learning, doing, and achieving. You can become a Founding Family for $1 too.

---

# 8. Referral mechanics

Do not over-engineer for v1.

Minimum viable referral system:

1. Each purchaser receives a referral code after successful payment.
2. Shared links use `?ref=CODE`.
3. Store source/referral attribution on new paid conversion.
4. Show referral count on the purchaser’s confirmation page or later email if technically practical.

Optional milestone language:

- 1 joined family → **Veya Builder**
- 3 joined families → **Founding Guide**
- 5 joined families → **Founding Circle**

These should initially be recognition/access rewards, not financial rewards.

---

# 9. Email lifecycle

Transactional email and optional marketing consent must remain separate.

## Transactional — immediately after purchase

Subject idea: `You’re a Veya Founding Family 🌱`

Include:

- receipt/payment confirmation
- confirmation that $1 is one-time
- development-status reminder
- what they receive
- support/refund contact

## Optional marketing sequence

For purchasers who opted in:

1. **Day 1:** Meet Veya / founder story
2. **Day 3:** See one product interaction
3. **Day 6:** One-question product vote
4. **Day 10:** Invite another family
5. **Later:** “What we built because of you” update

Do not imply a confirmed launch date unless one is actually established.

---

# 10. Analytics instrumentation

Use privacy-conscious analytics and avoid behavioral advertising to children.

Recommended events:

```text
page_view
hero_primary_cta_click
hero_secondary_cta_click
product_demo_view
founder_section_view
founding_offer_view
founding_offer_cta_click
checkout_started
checkout_payment_method_selected
checkout_completed
checkout_failed
welcome_view
segmentation_submitted
segmentation_skipped
referral_share_click
referral_link_copied
referred_visit
referred_checkout_completed
faq_opened
```

Recommended properties:

```text
utm_source
utm_medium
utm_campaign
utm_content
referral_code
landing_variant
cta_location
payment_method
selected_interest_segments
```

Do not send child-specific personal data into analytics.

---

# 11. A/B testing priorities

Do not test tiny design details before testing the offer story.

Priority order:

### Test 1 — Hero framing

A: `Big adventures. Progress you can see.`  
B: `The beautiful home for everything they’re learning.`

### Test 2 — CTA framing

A: `Become a Founding Family — $1`  
B: `Help Shape Veya — $1`

### Test 3 — Founder prominence

A: founder story immediately after hero  
B: product/problem before founder story

### Test 4 — Payment moment

A: checkout opens after offer explainer  
B: checkout on dedicated route

Core metric: **paid Founding Family conversion**, not email capture.

---

# 12. Responsive behavior

## Desktop

- max content width: 1180–1280px
- hero: 42–48% copy / 52–58% visual
- large editorial whitespace
- product screenshots can overlap nature illustrations
- cards 3–4 across

## Tablet

- maintain two-column hero when practical
- reduce decorative layers
- convert 4-card sections to 2×2

## Mobile

- headline and CTA first
- phones stacked/overlapping below copy
- CTA width 100% minus 20–24px page gutters
- sticky `$1 Early Access` CTA after hero
- cards stack vertically
- 4-step product flow can horizontally scroll with snap
- checkout becomes a full-screen route or bottom sheet with enough room for legal/consent text
- ensure all tap targets >= 44px

The supplied mobile mockup is a visual reference, not a literal pixel-perfect requirement.

---

# 13. Accessibility

Minimum requirements:

- WCAG AA color contrast
- semantic heading structure
- keyboard-accessible nav, modal, forms, and accordions
- visible focus states
- decorative illustrations use empty alt text
- meaningful product screenshots receive concise alt text
- form errors shown in text, not color only
- respect `prefers-reduced-motion`
- never place critical text only inside an image

---

# 14. Motion guidelines

Motion should feel exploratory and calm.

Good:

- slight phone parallax on hero
- gentle leaf drift
- 150–250ms card hover
- dotted path drawing between Choose → Do → Record → Celebrate
- subtle progress-ring animation

Avoid:

- bounce-heavy kids-app motion
- constant floating elements
- autoplay audio
- aggressive confetti before purchase

Confetti may be used once on successful Founding Family confirmation.

---

# 15. Suggested component tree

```text
App
├── AnnouncementBar
├── Header
│   ├── VeyaLogo
│   ├── DesktopNav
│   └── MobileMenu
├── Hero
│   ├── HeroCopy
│   ├── PrimaryCTA
│   ├── SecondaryCTA
│   └── PhoneShowcase
├── FounderProof
├── ProblemSection
│   └── BenefitCard x3
├── ProductLoop
│   └── ProductStep x4
├── FamilyUseCases
│   ├── UseCaseIconRow
│   └── GirlScoutCompatibilityCallout
├── VisionSection
│   └── VisionCard x4
├── TrustSection
│   └── TrustPoint x5
├── FoundingFamilyOffer
├── FounderStory
├── ClosingCTA
├── Footer
├── StickyMobileCTA
└── FoundingFamilyCheckout
    ├── OfferSummary
    ├── AdultDetails
    ├── PaymentElement
    ├── RequiredConsents
    └── CheckoutCTA
```

Post-purchase:

```text
FoundingFamilyWelcome
├── ConfirmationBadge
├── OptionalSegmentationSurvey
├── ReferralModule
└── SupportLinks
```

---

# 16. Suggested routes

```text
/                       homepage
/founding-family        checkout / offer detail
/welcome/founding-family confirmation + survey + share
/how-it-works           optional expanded product page
/our-story              optional founder story page
/faq                    FAQ
/privacy                privacy policy
/terms                  early access terms
/refunds                refunds policy
/contact                contact
/parent-support         parent support
```

FAQ may remain inline on homepage initially, but all legal/support routes must exist before payment is enabled.

---

# 17. Technical implementation notes

Framework is flexible. A sensible modern implementation:

- Next.js or equivalent SSR framework
- TypeScript
- Tailwind or scoped CSS/design tokens
- Stripe Payment Element / Checkout for $1 purchase
- lightweight database for adult purchaser + referral + segmentation records
- transactional email provider
- privacy-conscious analytics

Store content that may change — especially organization-specific wording, launch timing, pricing text, disclosure copy, support contact, and feature availability — in CMS/config rather than hardcoding across many components.

Never store raw card data.

---

# 18. Data model — minimal v1

```ts
type FoundingFamily = {
  id: string
  adultEmail: string
  adultName?: string
  country?: string
  paymentProviderCustomerId?: string
  paymentProviderPaymentId: string
  amountPaidCents: 100
  currency: string
  purchasedAt: string
  marketingOptIn: boolean
  referralCode: string
  referredByCode?: string
  interests?: string[]
}
```

Do not attach child profiles to the public-site purchase record.

---

# 19. Asset package

The delivered asset folder contains:

```text
assets/
├── veya-waitlist-master-mockup.png
├── veya-waitlist-mobile-reference.png
├── veya-app-showcase-reference.png
├── app-screen-home.png
├── app-screen-badge.png
├── app-screen-notebook.png
├── app-screen-journal.png
├── app-screen-gallery.png
├── checkout-reference.png
├── confirmation-reference.png
└── asset-board-reference.png
```

These generated images are visual direction / usable raster assets. For production UI, reconstruct interface text and controls in HTML/CSS rather than shipping screenshots as interactive content.

If using generated decorative artwork in production, optimize it to WebP/AVIF as appropriate and preserve PNG only where alpha transparency is needed.

---

# 20. Source-of-truth safety rules

Before launch:

- CTA must include `$1` on or immediately beside the button.
- Keep `one-time`, `not a subscription`, and active-development status plainly visible.
- Do not collect child information during public-site checkout.
- Do not display official Girl Scouts logos or official badge art without permission.
- Do not fabricate testimonials, family counts, partner relationships, founder quotes, launch dates, or live product capabilities.
- Make optional marketing consent separate from transactional access.
- Privacy, Terms, Refunds, Contact, and Parent Support must work before charging anyone.
- Verify recurring billing is disabled.
- Verify refund mechanics.
- Verify product features shown are live or labeled coming later.

---

# 21. Definition of done

The website is ready for launch only when an agent can verify all of the following:

- [ ] Desktop matches the supplied visual direction.
- [ ] Mobile matches the supplied mobile reference and does not feel like a shrunk desktop page.
- [ ] Hero explains Veya in under 5 seconds.
- [ ] Product value is demonstrated before payment is requested.
- [ ] `$1` is present in primary CTA language.
- [ ] Founding Family benefit list appears before payment fields.
- [ ] Checkout accepts only adult purchaser information.
- [ ] Successful payment lands on confirmation page.
- [ ] Optional segmentation survey works.
- [ ] Referral/share action works.
- [ ] Transactional confirmation email works.
- [ ] Optional marketing consent is separate.
- [ ] Analytics events fire correctly.
- [ ] Legal/support links resolve.
- [ ] No unapproved third-party marks are used.
- [ ] Accessibility checks pass.
- [ ] Page is tested at 375px, 768px, 1024px, and 1440px widths.

---

## Final product principle

Veya should not feel like a startup asking parents to wait.

It should feel like a beautiful product already taking shape — and the parent is being invited to become one of the families who helps shape what it becomes.
