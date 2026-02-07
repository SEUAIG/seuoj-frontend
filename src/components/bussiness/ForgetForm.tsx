import { forget_Schema, forget_Values } from "@/types/forget_schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
export default function ForgetForm() {
      const form = useForm<forget_Values>({
        resolver: zodResolver(forget_Schema),
        defaultValues: {
            email:""
        },
      });
        const { handleSubmit, register, control } = form;
        function onSubmit(values: forget_Values) {}
  return( <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 my-6 w-2/5 mx-auto bg-white p-6 rounded shadow-xl border"
      >               
      <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute top-1/2  left-2 -translate-y-1/2" />
                  <Input
                    placeholder="邮箱"
                    {...field}
                    className="h-11 rounded-lg pl-10 border-2"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
       <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          找回密码
        </Button>
      </form>
      </Form>)
}
