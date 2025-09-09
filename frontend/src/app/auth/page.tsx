import { LoginForm } from "@/components/auth-forms/login";
import { RegisterForm } from "@/components/auth-forms/register";
import { ModeToggle } from "@/components/mode-toggle";

export default function LoginPage() {
  return (
    <>
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="flex justify-center pt-10 text-center">
        <h1 className="text-2xl">
          Chat em tempo real <strong className="text-green-500">entre</strong> ou{" "}
          <strong className="text-green-500">crie</strong> uma conta para usar
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto p-8 content-center min-h-screen ">
        <LoginForm />
        <RegisterForm />
      </div>
    </>
  );
}
