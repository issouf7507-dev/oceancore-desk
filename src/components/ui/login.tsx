"use client";

import * as React from "react";
import { type UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeOff, Eye, Loader2 } from "lucide-react";

// Validation schema for the form
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
  rememberMe: z.boolean().default(false).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AuthFormSplitScreenProps {
  logo: React.ReactNode;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  onSubmit: (data: FormValues) => Promise<void>;
  forgotPasswordHref: string;
  createAccountHref: string;
  form: UseFormReturn<FormValues>;
  errorForm: boolean
  setErrorForm: (errorForm: boolean) => void
}

/**
 * A responsive, split-screen authentication form component.
 * @param logo - The component to be used as the logo (e.g., an SVG or text).
 * @param title - The main heading for the form.
 * @param description - A short description below the title.
 * @param imageSrc - URL for the image to display on the right panel.
 * @param imageAlt - Alt text for the image for accessibility.
 * @param onSubmit - Async function to handle form submission.
 * @param forgotPasswordHref - URL for the "Forgot Password" link.
 * @param createAccountHref - URL for the "Create Account" link.
 */
export function AuthFormSplitScreen({
  logo,
  title,
  description,
  imageSrc,
  imageAlt,
  onSubmit,

  createAccountHref,
  form,
  errorForm,

}: AuthFormSplitScreenProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false)



  const handleFormSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Submission failed:", error);
      // Optionally handle and display submission errors here
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants for staggering children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="relative flex h-screen w-full flex-col md:flex-row ">
      {/* Left Panel: Form */}
      <div className="flex w-full flex-col items-center justify-center  p-8 md:w-1/2">
        <div className="w-full max-w-md">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            <motion.div variants={itemVariants} className="mb-4">
              {logo}
            </motion.div>
            <motion.div variants={itemVariants} className="text-left">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </motion.div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-4"
              >
                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="email@example.com"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••••••"
                              {...field}
                              disabled={isLoading}
                              className="pr-10"
                            />

                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              disabled={isLoading}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-between"
                >
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal">
                            Se Souvenir de moi
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  {/* <a
                    href={forgotPasswordHref}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgotten Password
                  </a> */}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Continuer
                  </Button>
                </motion.div>
              </form>
            </Form>


            {errorForm && <div className="text-center">
              <p className="text-red-500">Une erreur c'est produite, verifier au identifiant</p>
            </div>}




            <motion.p
              variants={itemVariants}
              className="px-8 text-center text-sm text-muted-foreground"
            >
              Vous n'avez pas de compte?{" "}
              <a
                href={createAccountHref}
                className="font-medium text-primary hover:underline"
              >
                Contacter le support.
              </a>

            </motion.p>
          </motion.div>
        </div>

      </div>

      {/* Right Panel: Image */}
      <div className="relative hidden w-1/2 md:block ">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    </div>
  );
}