import { useNavigate } from 'react-router-dom'
import { useAuth } from '../core/Auth'
import { AuthFormSplitScreen } from "@/components/ui/login";
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useState } from 'react';
import loginO from "../../../assets/ocean-corsa.webp"

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
  const [errorForm, setErrorForm] = useState(false)
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

        console.log("error response", response);
        setErrorForm(true)

        toast("Erreur lors de l'authentification")

        throw new Error(
          `Login failed (${response.status}). ${text ? `Details: ${text}` : ""}`.trim()
        )

      }

      const payload = (await response.json()) as {
        token: string
        user: { id: number; name: string; email: string; roles?: string[] }
      }

      console.log(payload);



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
      description="Connectez-vous en entrant les informations ci-dessous manager@ocean.services mdpmanager@@"
      imageSrc={loginO}
      imageAlt="Une belle scène avec des collines et une route."
      onSubmit={handleLogin}
      forgotPasswordHref="#"
      createAccountHref="#"
      form={form}

      errorForm={errorForm}
      setErrorForm={setErrorForm}
    />
  )
}

// email: manager@ocean.services, password: mdpmanager@@