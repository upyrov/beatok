import { type } from "arktype";
import { CgAdd } from "react-icons/cg";
import { useCreateGenre, useGenres } from "~/api/genre";
import { ActionButton } from "~/components/action-button";
import { CrudManager } from "~/components/crud-manager";
import { InputField } from "~/components/input-field";
import { Genre } from "./genre";

export function Genres() {
	const genresQuery = useGenres();
	const genres = genresQuery.data ?? [];
	const createMutation = useCreateGenre();

	return (
		<CrudManager
			isLoading={genresQuery.isLoading}
			items={genres}
			emptyMessage="No genres found. Create one above!"
			defaultValues={{ name: "" }}
			onSubmit={async (value) => {
				await createMutation.mutateAsync({ name: value.name.trim() });
			}}
			createMutationError={createMutation.error}
			renderItem={(genre) => <Genre key={genre.id} genre={genre} />}
			renderFormFields={(form) => (
				<form.Field
					name="name"
					validators={{
						onChange: type("string > 0"),
					}}
					children={(field) => (
						<div className="flex gap-2 items-start">
							<InputField
								name={field.name}
								value={field.state.value}
								onChange={field.handleChange}
								onBlur={field.handleBlur}
								errors={field.state.meta.errors}
								placeholder="Genre name"
								className="flex-1"
							/>
							<form.Subscribe
								selector={(state) => [state.canSubmit, state.isSubmitting]}
								children={([canSubmit, isSubmitting]) => (
									<ActionButton
										type="submit"
										disabled={!canSubmit}
										pending={isSubmitting || createMutation.isPending}
									>
										<CgAdd />
									</ActionButton>
								)}
							/>
						</div>
					)}
				/>
			)}
		/>
	);
}
