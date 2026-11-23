import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";

const Privacy = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <main
      id="page-privacy"
      className="flex-1 w-full max-w-3xl mx-auto py-8 px-4 animate-fade-in flex flex-col gap-4"
    >
      <PageHeader onBack={() => navigate(-1)} title={t("privacy.title")} />

      <Card className="rounded-lg border bg-card text-card-foreground shadow-xs">
        <div className="p-4 sm:p-6 flex flex-col gap-6 text-sm sm:text-base leading-6">
          <p className="text-muted-foreground">{t("privacy.effectiveDate")}</p>

          <p>
            Chordium is a guitar chord sheet viewer. It is developed by Arthur
            Boss. This policy describes what the app does with data on your
            device and what leaves it.
          </p>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Data kept on your device</h2>
            <p>
              Saved chord sheets, preferences, and import or export files stay
              in the app's local storage. They are not uploaded to a Chordium
              account. You can remove them by deleting songs in the app or
              clearing the app's storage in Android settings.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Camera and microphone</h2>
            <p>
              The camera is used to scan QR codes for jam sessions. The
              microphone is used for the tuner and, where supported, voice
              search. Camera frames and audio are processed on the device.
              Chordium does not upload them to its servers. When voice search
              uses the device's speech service, that service may process audio
              under its own privacy policy.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Search</h2>
            <p>
              Search terms are sent to the Chordium API so it can find artists
              and songs. The API does not create a user account or store a
              search history tied to you. It may keep public artist and song
              metadata returned by searches. Hosting and database providers may
              keep short-lived technical request logs.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Backups</h2>
            <p>
              If Android backup is enabled on your device, Android may copy app
              data to your Google account so it can be restored after
              reinstalling the app. That backup is controlled by Android and
              your Google account settings.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Sharing</h2>
            <p>
              When you share a song or jam link, the link is created on your
              device and passed to the app you choose. Chordium does not
              receive a copy of what you share.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Third parties</h2>
            <p>
              Chordium uses Vercel for hosting and serverless functions and Neon
              for its song and artist database. These providers process requests
              on Chordium's behalf. Chordium does not sell personal data and
              does not include advertising or analytics SDKs.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Children</h2>
            <p>
              Chordium is not directed at children under 13 and does not
              knowingly collect personal data from them.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Changes</h2>
            <p>
              Material changes to this policy will be published on this page
              with a new effective date.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Contact</h2>
            <p>
              Privacy questions can be raised at{" "}
              <a
                href="https://github.com/arthurboss/chordium/issues"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/arthurboss/chordium/issues
              </a>
              .
            </p>
          </section>
        </div>
      </Card>
    </main>
  );
};

export default Privacy;
