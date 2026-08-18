import { PageContainer } from "~/components/page-container";
import type { Route } from "./+types/credits";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Beatok | Credits" },
    {
      name: "description",
      content: "Beatok contributors.",
    },
  ];
}

const contributors = [
  { name: "upyrov", url: "https://github.com/upyrov" },
  { name: "flamylight", url: "https://github.com/flamylight" },
];

export default function Credits() {
  return (
    <div className="flex flex-col flex-1">
      <PageContainer className="max-w-3xl py-16">
        <h1 className="text-4xl font-bold mb-8">Credits</h1>

        <div className="prose prose-gray dark:prose-invert">
          <p className="mb-4 text-gray-500">
            Beatok is proudly built and maintained by these open-source
            contributors:
          </p>

          <ul className="flex flex-col gap-2 mt-4">
            {contributors.map((contributor) => (
              <li key={contributor.name} className="m-0">
                <a
                  href={contributor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-4"
                >
                  {contributor.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </PageContainer>
    </div>
  );
}
