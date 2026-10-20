import { LegalPage } from "@/app/laundromat/legal/legal-page";
import { LegalSection } from "@/app/laundromat/legal/legal-section";
import { getLegalPageMetadata } from "@/lib/laundromat/legal/get-legal-page-metadata";
import { LEGAL_PAGES } from "@/lib/laundromat/legal/legal-pages";

const DESCRIPTION =
  "The terms for using laundro.cafe, its shared notebook and its tips.";

export const metadata = getLegalPageMetadata({
  ...LEGAL_PAGES.terms,
  description: DESCRIPTION,
});

export default function LaundromatTermsPage() {
  return (
    <LegalPage
      page="terms"
      intro="These terms apply when you use laundro.cafe. The site is made and run by Li Yuxuan, an individual in Singapore. By using the site, you agree to them."
    >
      <LegalSection heading="the site">
        <p>
          laundro.cafe is free to use and needs no account. Features may change
          or go away, and the site may sometimes be offline.
        </p>
        <p>
          The TV shows live streams from YouTube. They belong to their owners.
        </p>
      </LegalSection>

      <LegalSection heading="tips (coming soon)">
        <p>
          Tips are voluntary. They are in Singapore dollars, from S$1 to S$500,
          and are processed by Stripe. Stripe&apos;s own terms also apply to the
          payment.
        </p>
      </LegalSection>

      <LegalSection heading="thank-you tokens">
        <p>
          A tip gets you a digital thank-you token: a collectible coin you can
          use once for a cosmetic &ldquo;party wash&rdquo; in a washer or
          &ldquo;party dry&rdquo; in a dryer, with a glowing door and floating
          charms that everyone in the room can see during the cycle.
        </p>
        <ul>
          <li>Tokens have no cash value.</li>
          <li>
            Tokens cannot be exchanged for money, or sold or transferred for
            money.
          </li>
          <li>What tokens do on the site may change.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="refunds">
        <p>
          Tips are non-refundable, except where the law requires a refund. If
          you paid by mistake or paid twice, email me within 30 days of the
          payment with its date and amount.
        </p>
      </LegalSection>

      <LegalSection heading="your token code">
        <p>
          Each token comes with a code. Keep it private. Anyone with the code
          can restore the token.
        </p>
      </LegalSection>

      <LegalSection heading="the shared notebook">
        <p>
          Anyone can read the notebook. When you write or draw in it, do not
          post:
        </p>
        <ul>
          <li>anything illegal</li>
          <li>anything hateful, harassing or threatening</li>
          <li>
            personal data of other people, such as their contact details or
            address
          </li>
        </ul>
        <p>
          Visitors can report entries. I may hide or remove any entry at any
          time.
        </p>
        <p>
          You keep the rights to what you write or draw. You allow the site to
          show it to every visitor for as long as the notebook is kept.
        </p>
      </LegalSection>

      <LegalSection heading="fair use">
        <p>
          Do not try to break, overload or misuse the site or its live room, or
          get around its limits.
        </p>
      </LegalSection>

      <LegalSection heading="no warranty">
        <p>
          The site is provided as it is, without any warranty. I do not promise
          it will always be available, correct or free of errors.
        </p>
      </LegalSection>

      <LegalSection heading="limitation of liability">
        <p>
          As far as the law allows, I am not liable for any indirect or
          consequential loss from using the site. My total liability to you is
          limited to the tips you paid in the 12 months before your claim.
        </p>
      </LegalSection>

      <LegalSection heading="governing law">
        <p>
          These terms are governed by the laws of Singapore. The courts of
          Singapore decide any dispute about them.
        </p>
      </LegalSection>

      <LegalSection heading="changes">
        <p>
          I may update these terms. When I do, I will change the effective date
          on this page. If you keep using the site after that, the new terms
          apply.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
