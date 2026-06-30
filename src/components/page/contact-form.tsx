"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { sendContactEmail } from "@/lib/actions/contact";

export function ContactForm() {
  const t = useTranslations("contact");
  const [isPending, startTransition] = useTransition();

  const formSchema = z.object({
    fullName: z.string().min(2, { message: t("validation.minLength", { min: 2 }) }),
    email: z.string().email({ message: t("validation.invalidEmail") }),
    phone: z.string().optional(),
    company: z.string().optional(),
    subject: z.string().min(2, { message: t("validation.minLength", { min: 2 }) }),
    message: z.string().min(10, { message: t("validation.minLength", { min: 10 }) }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      company: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const result = await sendContactEmail(values);
        if (result.success) {
          toast.success(t("form.success"));
          form.reset();
        } else {
          console.error("Contact form submission failed:", result.error);
          toast.error(t("form.error"));
        }
      } catch (error) {
        console.error("Contact form error:", error);
        toast.error(t("form.error"));
      }
    });
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.fullName")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("form.fullName")} {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.email")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("form.email")} type="email" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.phone")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("form.phone")} type="tel" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.company")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("form.company")} {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.subject")}</FormLabel>
              <FormControl>
                <Input placeholder={t("form.subject")} {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.message")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("form.message")}
                  className="min-h-[120px]"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 w-full md:w-auto"
        >
          {isPending ? t("form.submitting") : t("form.submit")}
        </button>
      </form>
    </Form>
  );
}
