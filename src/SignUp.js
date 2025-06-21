// src/SignUp.js
import React, { useState } from "react";
import { Button, Container, Group, Paper, PasswordInput, Text, TextInput, Title } from "@mantine/core";
import { createUserWithEmailAndPassword } from "firebase/auth"; // Import Firebase sign-up function
import { auth } from "./firebase"; // Import Firebase auth instance

export function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // For displaying errors
  const [loading, setLoading] = useState(false); // For showing a loading state during sign-up

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      await createUserWithEmailAndPassword(auth, email, password); // Firebase sign-up
      alert("Account created successfully!"); // On successful sign-up
      // Redirect to login or another page (you can use React Router here)
    } catch (err) {
      setError(err.message); // Display error if sign-up fails
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Container size={420} my={40}>
      <Title align="center">Create an Account</Title>

      <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
        <form onSubmit={handleSignUp}>
          <TextInput
            label="Email"
            placeholder="you@mantine.dev"
            required
            radius="md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            radius="md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Text color="red" size="sm">{error}</Text>} {/* Display error if any */}

          <Group justify="space-between" mt="lg">
            <Text size="sm">Already have an account?</Text>
            <Button fullWidth mt="xl" radius="md" type="submit" loading={loading}>
              Sign Up
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
