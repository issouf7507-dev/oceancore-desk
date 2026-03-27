import { useNavigate } from 'react-router-dom'
import { useAuth } from '../core/Auth'
import { AuthFormSplitScreen } from "@/components/ui/login";
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
  rememberMe: z.boolean().default(false).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function Login() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
  const navigate = useNavigate()
  const { saveAuth, setCurrentUser } = useAuth()

  const handleLogin = async (data: FormValues) => {
    try {
      if (!data.email.trim() || !data.password.trim()) {
        return
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/desktop/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: data.email.trim(),
            password: data.password.trim(),
          }),
        }
      )

      if (!response.ok) {
        const text = await response.text().catch(() => "")
        throw new Error(
          `Login failed (${response.status}). ${text ? `Details: ${text}` : ""}`.trim()
        )
      }

      const payload = (await response.json()) as {
        token: string
        user: { id: number; name: string; email: string; roles?: string[] }
      }

      saveAuth({ api_token: payload.token, user: payload.user })
      setCurrentUser(payload.user)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      console.error(error)
    }
  };

  return (
    <AuthFormSplitScreen
      logo={
        <h1 className="text-xl font-bold text-green-500 tracking-wider">Ocean Transport Core</h1>
      }
      title="Bienvenue!"
      description="Connectez-vous en entrant les informations ci-dessous"
      imageSrc="https://images.unsplash.com/photo-1714715350295-5f00e902f0d7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8d2FsbHBhZXJ8ZW58MHwxfDB8fHww&auto=format&fit=crop&q=60&w=900"
      imageAlt="Une belle scène avec des collines et une route."
      onSubmit={handleLogin}
      forgotPasswordHref="#"
      createAccountHref="#"
      form={form}
    />
  )
}

// email: manager@ocean.services, password: mdpmanager@@