import { PageContainer } from "~/components/page-container";

export function meta() {
	return [{ title: "Beatok | Terms of Service" }];
}

export default function TermsOfService() {
	return (
		<div className="flex flex-col flex-1">
			<PageContainer className="max-w-3xl py-16">
				<h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

				<div className="prose prose-gray dark:prose-invert">
					<p className="mb-4 text-gray-500">Last updated: August 12, 2026</p>

					<h2 className="text-2xl font-bold mt-8 mb-4">
						1. Acceptance of Terms
					</h2>
					<p className="mb-4">
						By accessing or using Beatok, you agree to be bound by these Terms
						of Service and all applicable laws and regulations. If you do not
						agree with any of these terms, you are prohibited from using or
						accessing this site.
					</p>

					<h2 className="text-2xl font-bold mt-8 mb-4">2. User Accounts</h2>
					<p className="mb-4">
						Our service can be used anonymously without creating an account. If
						you choose to use the service anonymously, you do so at your own
						risk. We do not hold any responsibility for the security of your
						account, your data, or any content you submit.
					</p>

					<h2 className="text-2xl font-bold mt-8 mb-4">
						3. Content and Copyright
					</h2>
					<p className="mb-4">
						By uploading audio files ("beats") to Beatok, you represent and
						warrant that you own the rights to the content or have obtained all
						necessary permissions. You retain all of your ownership rights in
						your content, but you grant Beatok a worldwide, non-exclusive,
						royalty-free license to use, reproduce, and display that content in
						connection with the service.
					</p>

					<h2 className="text-2xl font-bold mt-8 mb-4">4. Acceptable Use</h2>
					<p className="mb-4">
						You agree not to use the Service for any unlawful purpose or in any
						way that interrupts, damages, or impairs the service. Any abuse of
						the voting system or harassment of other users will result in an
						immediate ban.
					</p>
				</div>
			</PageContainer>
		</div>
	);
}
