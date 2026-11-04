import { PawsLegalPage } from "@/app/paws/_legal/paws-legal-page";
import { PawsLegalSection } from "@/app/paws/_legal/paws-legal-section";
import { LEGAL_CONTACT_EMAIL } from "@/lib/laundromat/legal/legal-contact-email";
import { getPawsLegalPageMetadata } from "@/lib/paws/legal/get-paws-legal-page-metadata";
import { PAWS_LEGAL_PAGES } from "@/lib/paws/legal/paws-legal-pages";

const DESCRIPTION =
  "What paws.garden keeps, where it goes, and what you can do about it.";

export const metadata = getPawsLegalPageMetadata({
  ...PAWS_LEGAL_PAGES.privacy,
  description: DESCRIPTION,
});

export default function PawsPrivacyPage() {
  return (
    <PawsLegalPage
      page="privacy"
      intro="paws.garden is a small shared room of cats on the web. It is made and run by Li Yuxuan, an individual in Singapore. There are no ads. This page lists what the site keeps, where it goes, and what you can do about it."
    >
      <PawsLegalSection heading="guests and accounts">
        <p>
          When you open the site, it makes a guest account for you with a random
          id, so you can watch a room. A guest account has no name and no email
          address.
        </p>
        <p>
          To make and bring your own cat, you sign in with your email address.
          The site emails you a 6-digit code; there is no password. Your email
          address is added to your account and stored by Supabase, which runs
          the sign-in. The code is sent from hello@paws.garden through Resend.
          Your email address is used only to sign you in, and is never shown to
          other visitors or used for anything else.
        </p>
        <p>
          Cloudflare Turnstile checks that a person, not a bot, is using the
          site before a guest account is made or a sign-in code is sent. See{" "}
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noopener"
          >
            Cloudflare&apos;s privacy policy
          </a>
          .
        </p>
      </PawsLegalSection>

      <PawsLegalSection heading="your cat">
        <p>
          When you save your cat, the site stores its look (coat, pattern, size,
          ears, tail and so on) and its voice settings, linked to your account,
          with the times it was made and last changed. Cats have no names, and
          the meows are recordings that come with the site; nothing is recorded
          from your microphone.
        </p>
      </PawsLegalSection>

      <PawsLegalSection heading="sharing a room">
        <p>
          While you are in a room, your browser joins a live channel so visitors
          can see each other. Everyone else in the room receives:
        </p>
        <ul>
          <li>your account id</li>
          <li>your cat&apos;s look and voice, if you brought it</li>
          <li>where your finger or pointer is, and when you press</li>
          <li>paw prints, toys and sounds you make</li>
          <li>
            <strong>what you type in the chat</strong>
          </li>
        </ul>
        <p>
          This live data passes through Supabase Realtime. Chat lines are not
          stored. For each line, the site keeps only which room you sent it in
          and when, to limit how often one person writes; your lines older than
          an hour are deleted the next time you send one. It also keeps which
          room you are in until you leave, or soon after if your tab closes, and
          when you joined a room; your joins older than ten minutes are deleted
          the next time you join.
        </p>
      </PawsLegalSection>

      <PawsLegalSection heading="what stays in your browser">
        <ul>
          <li>your sign-in session, in local storage</li>
          <li>
            the email address you asked a code for and which kind of code it
            was, in session storage, until you close the tab
          </li>
          <li>
            the <code>paws-locale</code> cookie, which remembers the language
            you pick for one year
          </li>
          <li>the Mastodon server you last shared a photo to</li>
        </ul>
        <p>
          There are no advertising cookies. To remove these, clear the site data
          for paws.garden in your browser.
        </p>
      </PawsLegalSection>

      <PawsLegalSection heading="your location">
        <p>
          The site never asks for your device&apos;s location. Vercel, which
          hosts the site, estimates a location from your IP address, and the
          site uses it only to draw the sky over the room. It is not sent to
          other visitors or stored.
        </p>
      </PawsLegalSection>

      <PawsLegalSection heading="photos and invites">
        <p>
          The camera takes its photos of the room in your browser. Saving or
          copying a photo keeps it on your device. Sharing hands the photo, a
          short text and a link to the app or site you pick. The site does not
          upload your photos.
        </p>
        <p>
          An invite link holds the room and your cat&apos;s look. Its preview
          picture is drawn from the link alone.
        </p>
      </PawsLegalSection>

      <PawsLegalSection heading="visit counts and server logs">
        <p>
          Vercel Web Analytics counts page views: the page, where you came from,
          your browser, device type and country. It uses no cookies. Vercel also
          keeps short-lived request logs that include IP addresses. See{" "}
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noopener"
          >
            Vercel&apos;s privacy policy
          </a>
          .
        </p>
      </PawsLegalSection>

      <PawsLegalSection heading="who receives data">
        <ul>
          <li>Vercel: hosting, IP location, page view counts</li>
          <li>
            Supabase: accounts, email codes, saved cats and the live rooms, and
            sign-in logs that include IP addresses (
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener"
            >
              privacy policy
            </a>
            )
          </li>
          <li>Cloudflare: the Turnstile bot check</li>
          <li>
            Resend: your email address, to send the sign-in code (
            <a
              href="https://resend.com/legal/privacy-policy"
              target="_blank"
              rel="noopener"
            >
              privacy policy
            </a>
            )
          </li>
        </ul>
        <p>I do not sell your data or use it for ads.</p>
      </PawsLegalSection>

      <PawsLegalSection heading="keeping and deleting">
        <p>
          Your account and your cat are kept until you delete them. When you are
          signed in, open the menu and pick <strong>Delete my data</strong>.
          This deletes your account, your email address, your cat and your room
          records right away, and you stay in the room as a guest. It cannot be
          undone.
        </p>
        <p>
          You can also email{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>{" "}
          from the address you sign in with to ask what is stored about you, or
          to have your account deleted. Supabase&apos;s sign-in logs, which
          include IP addresses, are kept by Supabase for a short time and are
          not deleted with your account.
        </p>
      </PawsLegalSection>

      <PawsLegalSection heading="children">
        <p>
          Signing in is not meant for children under 13. If you think a child
          has signed in, email me and I will delete the account.
        </p>
      </PawsLegalSection>

      <PawsLegalSection heading="changes">
        <p>
          If this policy changes, I will update this page and its effective
          date.
        </p>
      </PawsLegalSection>
    </PawsLegalPage>
  );
}
