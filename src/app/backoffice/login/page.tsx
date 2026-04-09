import BackofficeLoginForm from "@/app/backoffice/login/login-form";

type BackofficeLoginPageProps = {
  searchParams?: Promise<{ redirect?: string }>;
};

export default async function BackofficeLoginPage({ searchParams }: BackofficeLoginPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const redirectRaw = params?.redirect;
  const redirectTo =
    typeof redirectRaw === "string" && redirectRaw.startsWith("/")
      ? redirectRaw
      : "/tokko";

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <BackofficeLoginForm redirectTo={redirectTo} />
    </main>
  );
}
