import { PageContainer } from "~/components/page-container";

export function meta() {
  return [{ title: "Beatok | Privacy Policy" }];
}

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col flex-1">
      <PageContainer className="max-w-3xl py-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="prose prose-gray dark:prose-invert">
          <p className="mb-4 text-gray-500">Last updated: August 12, 2026</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to Beatok. We respect your privacy and are committed to
            protecting your personal data. This privacy policy will inform you
            as to how we look after your personal data when you visit our
            website and tell you about your privacy rights.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            2. The Data We Collect
          </h2>
          <p className="mb-4">
            We may collect, use, store and transfer different kinds of personal
            data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Identity Data</strong> includes username and profile
              picture.
            </li>
            <li>
              <strong>Contact Data</strong> includes email address.
            </li>
            <li>
              <strong>Technical Data</strong> includes internet protocol (IP)
              address, browser type and version.
            </li>
            <li>
              <strong>Content Data</strong> includes the beats and audio files
              you upload to our platform.
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            3. How We Use Your Data
          </h2>
          <p className="mb-4">
            We will only use your personal data when the law allows us to. Most
            commonly, we will use your personal data to manage your account and
            lobbies.
          </p>
        </div>
      </PageContainer>
    </div>
  );
}
