# Veya Builder North Star

**Version:** 1.0  
**Date:** September 7, 2026  
**For:** Veya's founders, designers, developers, content creators, and AI agents

## Start here

Veya was created by girls who wanted a better way to see what they had accomplished, understand what came next, and feel proud of their progress.

Build from the assumption that organizations serving girls will be proud to see young members thoughtfully improving their experience. Veya should be bold, generous, useful, and respectful. Do not make the product vague or frustrating out of fear. When something is uncertain, build the most useful reversible version, record the decision, and keep moving.

Veya is its own product. It is not pretending to be Girl Scouts, replacing Girl Scouts, or awarding official badges. It is a beautiful companion that helps families use programs they already value.

## Audience scope

- **Now:** Girl Scout families only (Daisy through Ambassador).
- **Later:** Expand to more people and kinds of real-world learning.
- Keep organization-specific content in reversible packs so expansion does not require rewriting the core product.
- Do not market non–Girl Scout use cases as available until they ship.

See also `docs/veya/POSITIONING.md`.

## The north star

> Help a girl understand what she can do, see how far she has come, and choose what she wants to explore next.

Every important product decision should improve at least one of these outcomes:

1. **Clarity:** She knows what she is working toward.
2. **Momentum:** The next meaningful action feels easy to begin.
3. **Ownership:** She can record, reflect on, and celebrate her work.
4. **Connection:** A parent or trusted adult can support her without taking over.
5. **Possibility:** Veya opens a wider world of skills, interests, and adventures.

## What Veya is

**Today,** Veya is a progress companion for Girl Scout families. It helps girls and parents:

- Discover and organize Girl Scout badges and requirements by level.
- Track progress without scattered papers and screenshots.
- Save notes, dates, reflections, and completion evidence.
- See related skills and choose what to explore next.
- Celebrate progress without confusing Veya progress with an official award decision.

Girl Scout badge tracking is the product we ship first because the founders are building from their own experience. The underlying architecture should remain ready for other programs and family adventures later — without claiming those audiences prematurely.

## Product posture

### Build proudly

- Tell the true founder story: Veya was created by two Girl Scout members solving a problem they experienced themselves.
- Make the Girl Scout experience genuinely useful, not buried behind generic language.
- Use correct badge names and levels where they are needed to help a family identify what it is tracking.
- Make progress tracking feel magical, warm, and motivating.
- Treat families and youth organizations as future collaborators.

### Build independently

- Veya must retain its own name, logo, color system, navigation, illustrations, achievement system, and voice.
- Veya should never visually imitate an official Girl Scouts product.
- Veya does not decide whether an official badge has been earned.
- Official program materials remain the authority for required activities and choices.
- Until authorized, do not describe Veya as affiliated with, approved by, endorsed by, or partnered with Girl Scouts of the USA or a local council.

### Build reversibly

Uncertainty is not a reason to stop. It is a reason to avoid hard-coding.

- All organization-specific content must live in a remotely managed content pack.
- Every pack, badge, field, sentence, and image must be independently switchable.
- Removing a public reference must never erase a child's saved progress.
- Content changes should not require an App Store release whenever technically possible.
- Keep Veya-original content separate from referential, user-supplied, and licensed content.

## The usefulness rule

Veya should be close enough to the real program to help a family plan and track its work, but it should not try to replace the official handbook, badge booklet, Volunteer Toolkit, membership, troop leader, or council.

For an organization-specific badge, the ideal unlicensed experience includes:

- Official badge title in plain text.
- Relevant program level.
- A Veya-original icon, visually distinct from official artwork.
- A short, independently written action summary for each major step.
- Progress states: not started, in progress, ready to review, and completed.
- Space for private notes, dates, links, and evidence.
- A prominent link or direction to consult the official material.
- A short statement that Veya is an independent tracker and does not confer the official award.

It should not include, unless licensed:

- Official badge artwork, trefoils, insignia, handbook pages, or screenshots.
- Verbatim official requirement text.
- Close recreations of official artwork.
- Complete official option lists, examples, scripts, worksheets, stories, or instructional explanations.
- Language suggesting that a Veya checkmark automatically earns an official badge.

## Content writing standard

### Write the objective, not a disguised copy

Read enough to understand the skill or outcome, then write a short action label from scratch. Do not rewrite the official sentence word by word with synonyms.

Good Veya summaries are:

- Brief: normally 3–10 words.
- Functional: they identify the action being tracked.
- Original: written in Veya's voice.
- Non-substitutive: families still consult official materials for choices and instructions.
- Age-clear: understandable without sounding babyish.

Example pattern:

```text
Badge: [official badge title]
Step 1: Discover [subject]
Step 2: Try [core action]
Step 3: Investigate [topic]
Step 4: Make or practice [outcome]
Step 5: Share what you learned
```

Do not copy unique examples, sequences of suggested projects, prose explanations, or distinctive phrases from official publications.

### Use one confident disclosure

Do not cover every screen with defensive disclaimers. Place a concise disclosure:

- On the first organization-specific badge screen.
- Behind an information icon thereafter.
- In the FAQ and legal footer.

Recommended language:

> Veya is an independent progress companion. Use it alongside your official program materials, which remain the authority for requirements and awards. Veya is not affiliated with or endorsed by Girl Scouts of the USA.

## Content and rights model

Every achievement record must include provenance. Agents must never create organization-specific content without assigning these fields.

```yaml
id: stable_internal_id
provider: veya | user | gsusa | other
program_name: optional
official_title: optional
display_title: required
level: optional
category: optional
veya_step_summaries: []
official_source_url: optional
source_version: optional
source_checked_at: optional
content_author: required
rights_status: original | private_user_entry | referential | licensed
art_status: original | user_supplied | licensed
enabled: true
publicly_searchable: true
last_reviewed_at: required
notes: optional
```

### Rights statuses

- **Original:** Veya owns or has permission to use the content.
- **Private user entry:** A parent entered content for private family use; it is not published to other users.
- **Referential:** Veya uses only what is reasonably needed to identify and track an outside program, with original summaries and a link to the authoritative source.
- **Licensed:** The provider has granted written permission covering the displayed content and use.

Agents must not silently change `rights_status`. Any change to `licensed` requires a link or internal reference to the written authorization.

## Reversible architecture requirements

Before public beta, implement:

1. **Pack-level switch:** Disable all Girl Scout-specific public content remotely.
2. **Record-level switch:** Disable a single badge without deploying a new app version.
3. **Field-level override:** Replace or hide a title, step summary, link, or image remotely.
4. **Safe fallback:** Convert a hidden reference into a private custom achievement while preserving the user's completion state, dates, and notes.
5. **Asset separation:** Store official/licensed assets separately from Veya-original artwork.
6. **Search removal:** Disabled content must disappear from search and recommendations.
7. **Audit history:** Record what changed, when, why, and by whom.
8. **Source versioning:** Badge updates must not silently rewrite a family's historical record.
9. **Export:** Families can export their own progress even if a content pack changes.
10. **Rights contact:** Maintain a monitored email address for content questions and correction requests.

## A request from an organization is collaboration, not a crisis

If Girl Scouts or another organization contacts Veya:

1. Be warm, proud, and responsive.
2. Thank them for reviewing a product created by young members.
3. Ask which exact content, artwork, phrase, or behavior concerns them.
4. Hide the specific item promptly when appropriate; do not destroy user progress.
5. Preserve the relevant source and decision history privately.
6. Invite them to suggest the preferred treatment.
7. Ask whether they are open to a pilot, permission, licensing, or an approved integration.
8. Escalate actual legal demands to the responsible adult and counsel.

Do not argue publicly, imply approval, or make broad deletions when a narrow change resolves the issue.

## Child and family privacy

Privacy should feel like good product design, not paperwork.

- A parent or guardian owns the family account and completes purchases.
- Do not request a child's full legal name when a nickname works.
- Do not request an exact birthday when a program level works.
- Keep children's progress private by default.
- Avoid behavioral advertising and sale of children's data.
- Avoid open chat, public profiles, public leaderboards, and discoverable troop directories in the initial product.
- Do not collect location, voice, photos, or contacts unless a clear product need, consent flow, retention rule, and deletion flow have been approved.
- Review every analytics, authentication, notification, crash-reporting, and payment service for what it collects.
- Give parents understandable controls to access, export, and delete family data.
- Collect payment information only through the payment provider; Veya should not store card details.

Agents may propose richer features, but they must identify what new data is collected, why it is needed, who receives it, how long it remains, and how a parent deletes it.

## The $1 Founding Family offer

Early access costs **$1 once**. It is not a subscription.

The purpose is commitment and community, not maximizing early revenue. The offer should feel delightfully accessible and honest.

The $1 includes:

- A place in the early-access group.
- Priority invitation when the relevant beta opens.
- Founder updates sent to the adult purchaser.
- Opportunities for the family to give product feedback.

The $1 does not purchase:

- Girl Scout membership.
- An official badge or award.
- Official badge books or program materials.
- A guaranteed partnership or endorsement.
- Lifetime access unless Veya explicitly decides to offer it.

Checkout must clearly show:

- `$1 one-time payment`.
- `Not a subscription`.
- The expected access window or the fact that timing is not yet fixed.
- What the purchaser receives immediately and later.
- The refund policy.
- `Parent or guardian checkout required`.

Recommended customer-friendly policy:

> If Veya cannot offer your family early access, the $1 will be refunded. Before launch, a parent may also request a refund by contacting [support email].

Do not use a pre-checked marketing-consent box. The purchaser's receipt and necessary access updates may be sent as transactional communications; optional marketing should use a separate choice.

## Product priorities

### Must work beautifully

1. A parent sets up the family.
2. A girl finds or adds what she is working on.
3. She can understand the next step.
4. She records progress in seconds.
5. Parent and child can review what she accomplished.
6. A content update never loses her work.

### Build next

- Recommendations based on interests and completed skills.
- Private reflections and a portfolio view.
- Original Veya adventures that bridge multiple youth programs.
- Parent-created custom achievements.
- Family goals and real-world learning journeys.
- Approved organization content packs and integrations.

### Not initially

- Public child profiles.
- Child-to-child direct messages.
- Public location sharing.
- Competitive rankings across families.
- Advertising targeted to children.
- Claims that Veya certifies third-party awards.

These are sequencing choices, not statements that Veya can never grow into a carefully designed version later.

## Agent decision protocol

When an agent encounters uncertainty:

1. **Protect the north star:** Does this help a girl understand, act, own, connect, or explore?
2. **Choose usefulness:** Prefer the version that solves the real family problem.
3. **Make it reversible:** Put uncertain content or behavior behind configuration.
4. **Minimize substitution:** Link to official instructions instead of republishing them.
5. **Preserve progress:** Never sacrifice the child's work because external content changes.
6. **Record the decision:** Add a short note to the content or architecture ledger.
7. **Escalate narrowly:** Ask a responsible adult only when the choice involves money, public claims of affiliation, sensitive child data, or content that cannot be quickly removed.

Agents should not stop work merely because a feature mentions another organization. They should implement the useful, referential, reversible version and clearly flag anything that would benefit from permission.

## Definition of ready for public early access

- The founder story is accurate and approved by the family.
- The $1 offer and expected timing are clear.
- An adult controls checkout and the developer accounts.
- Veya has its own branding and original achievement artwork.
- Organization-specific content is remotely configurable.
- Badge references use concise, original planning summaries.
- Official sources are linked where available.
- The independent-companion disclosure appears in the right places.
- No screen implies that Veya officially awards third-party badges.
- Child data is private by default.
- The privacy policy, terms, refund policy, and support contact are live.
- Parent access, export, and deletion paths have been tested.
- The team can hide a content pack without an app release or loss of progress.
- A representative sample of organization-specific records has received focused IP review before broad public distribution.

## The final test

Before shipping, ask:

> If the girls who created Veya demonstrated this screen to Girl Scouts leadership, would they be able to explain—with confidence and pride—how it helps members, respects the official program, protects families, and invites collaboration?

If yes, ship it. If almost, make the narrow improvement and keep going.

## Reference points

- [Girl Scouts copyright and trademark FAQ](https://www.girlscouts.org/en/footer/faq/copyrights-trademarks-faq.html)
- [Girl Scouts terms and conditions](https://www.girlscouts.org/en/footer/help/terms-and-conditions.html)
- [FTC COPPA compliance guidance](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Families Policies](https://support.google.com/googleplay/android-developer/answer/9893335)

This is a product and operating brief, not legal advice. Focused legal review should strengthen the launch without replacing the founders' judgment or slowing ordinary product work.
