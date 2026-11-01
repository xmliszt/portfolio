import { PawsLegalPage } from "@/app/paws/_legal/paws-legal-page";
import { PawsLegalSection } from "@/app/paws/_legal/paws-legal-section";
import { getPawsLegalPageMetadata } from "@/lib/paws/legal/get-paws-legal-page-metadata";
import { PAWS_LEGAL_PAGES } from "@/lib/paws/legal/paws-legal-pages";

const DESCRIPTION = "The terms for using paws.garden, its rooms and its chat.";

export const metadata = getPawsLegalPageMetadata({
  ...PAWS_LEGAL_PAGES.terms,
  description: DESCRIPTION,
});

export default function PawsTermsPage() {
  return (
    <PawsLegalPage
      page="terms"
      intro="These terms apply when you use paws.garden. The site is made and run by Li Yuxuan, an individual in Singapore. By using the site, you agree to them."
    >
      <PawsLegalSection heading="the site">
        <p>
          paws.garden is free to use. You can watch as a guest, or sign in with
          an email code to make and bring one cat. Features may change or go
          away, and the site may sometimes be offline.
        </p>
      </PawsLegalSection>

      <PawsLegalSection heading="your account">
        <p>
          Sign in only with an email address that is yours. Keep your sign-in
          codes private. Signing in is for people aged 13 or older.
        </p>
      </PawsLegalSection>

      <PawsLegalSection heading="the chat">
        <p>Everyone in the room sees what you write. Do not post:</p>
        <ul>
          <li>anything illegal</li>
          <li>anything hateful, harassing or threatening</li>
          <li>
            personal data of other people, such as their contact details or
            address
          </li>
          <li>spam or advertising</li>
        </ul>
        <p>
          I may limit, suspend or delete any account that breaks these terms, at
          any time.
        </p>
      </PawsLegalSection>

      <PawsLegalSection heading="fair use">
        <p>
          Do not try to break, overload or misuse the site or its live rooms, or
          get around its limits.
        </p>
      </PawsLegalSection>

      <PawsLegalSection heading="no warranty">
        <p>
          The site is provided as it is, without any warranty. I do not promise
          it will always be available, correct or free of errors, or that your
          cat will be kept forever.
        </p>
      </PawsLegalSection>

      <PawsLegalSection heading="limitation of liability">
        <p>
          As far as the law allows, I am not liable for any indirect or
          consequential loss from using the site. The site is free, and my total
          liability to you is limited to S$50.
        </p>
      </PawsLegalSection>

      <PawsLegalSection heading="governing law">
        <p>
          These terms are governed by the laws of Singapore. The courts of
          Singapore decide any dispute about them.
        </p>
      </PawsLegalSection>

      <PawsLegalSection heading="changes">
        <p>
          I may update these terms. When I do, I will change the effective date
          on this page. If you keep using the site after that, the new terms
          apply.
        </p>
      </PawsLegalSection>
    </PawsLegalPage>
  );
}
