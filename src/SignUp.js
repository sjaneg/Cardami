// src/SignUp.js
import React, { useState } from "react";
import { 
  Button, 
  Container, 
  Group, 
  Paper, 
  PasswordInput, 
  Text, 
  TextInput, 
  Title,
  Divider,
} from "@mantine/core";
import { createUserWithEmailAndPassword } from "firebase/auth"; // Import Firebase sign-up function
import { auth } from "./firebase"; // Import Firebase auth instance
import { useMantineTheme } from '@mantine/core'; //import maintine theme
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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

  const handleGoogleSignUp = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
    alert('Signed in with Google!');
  } catch (error) {
    console.error(error.message);
  }
};


  const theme = useMantineTheme();
  const navigate = useNavigate();

  return (
    <>
    <h1 className="absolute top-2 left-4">Cardami</h1>
    <div className="flex flex-col justify-center h-screen w-screen">
      <Container style={{ maxWidth: 400, width: '100%'}}>
        <Title align="center">Sign up</Title>

        <Paper p={22} mt="md" radius="md" style={{ backgroundColor: theme.colors.dark[6]}}>
          <form onSubmit={handleSignUp}>
            <TextInput
              label="Email"
              placeholder="you@example.com"
              required
              radius="md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              styles={(theme) => ({
                input: {
                  backgroundColor: theme.colors.dark[5],
                  color:'white'
                },
              })}
            />
            <PasswordInput
              label="Password"
              placeholder="your password"
              required
              mt="xs"
              radius="md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              styles={(theme) => ({
                input: {
                  backgroundColor: theme.colors.dark[5],
                  color:'white'
                },
              })}
            />

            <Button 
              mt="xl"
              fullWidth
              radius="xl" // fully rounded corners
              styles={(theme) => ({
                root: {
                  backgroundColor: theme.colors.dark[5],
                  color: 'white',
                  borderRadius: 9999, // extra safe full rounding
                  borderColor:'white',
                },
              })}
              type="submit" size="sm">Create Account</Button>

            {error && <Text c="red" size="sm">{error}</Text>} {/* Display error if any */}

            </form>

            {/* Divider with OR */}
            <Divider
              label="OR"
              labelPosition="center"
              my="md"
              color={theme.colors.dark[3]}
              styles={{
                label: {
                  fontSize: '1rem',
                  color: theme.colors.dark[0],
                },
              }}
            />

            {/* Sign Up with Google button */}
            <Button
              fullWidth
              radius="xl" // fully rounded corners
              styles={(theme) => ({
                root: {
                  backgroundColor: theme.colors.dark[5],
                  color: 'white',
                  borderRadius: 9999, // extra safe full rounding
                  borderColor:'white',
                },
              })}
              onClick={handleGoogleSignUp}
            >
              Sign up with Google
            </Button>

            <Group position="center" spacing="xs" mt="md" style={{width: '100%' }}>
              <Text size="xs" style={{ flexShrink: 0, color:theme.colors.dark[0]}}>
                Already have an account?
              </Text>
              <Text
                size="xs"
                onClick={() => navigate('/login')}
                style={{
                  color: '#228be6', // Mantine's default blue[6], or customize it
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Login
              </Text>
            </Group>

        </Paper>
      </Container>
    </div>
    </>
    
  );
}
