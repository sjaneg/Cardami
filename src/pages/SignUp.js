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
import { auth } from "../firebase"; // Import Firebase auth instance
import { useMantineTheme } from '@mantine/core'; // Import Mantine theme
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const db = getFirestore(); // Firebase Firestore instance

export function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // For displaying errors
  const [loading, setLoading] = useState(false); // For showing a loading state during sign-up

  const theme = useMantineTheme();
  const navigate = useNavigate();

  // Handle sign-up with email and password
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password); // Firebase sign-up
      const user = userCredential.user;

      // Create the user's document in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        cards: [] // Initialize an empty array for cards
      });

      alert("Account created successfully!"); // On successful sign-up
      navigate("/home"); // Redirect to home page after sign-up
    } catch (err) {
      setError(err.message); // Display error if sign-up fails
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Handle Google sign-up
  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Create the user's document in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        cards: [] // Initialize an empty array for cards
      });

      navigate('/home'); // Redirect to home page after Google sign-up
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <>
      <h1 className="absolute top-2 left-4">Cardami</h1>
      <div className="flex flex-col justify-center h-screen w-screen">
        <Container style={{ maxWidth: 400, width: '100%' }}>
          <Title align="center">Sign up</Title>

          <Paper p={22} mt="md" radius="md" style={{ backgroundColor: theme.colors.dark[6] }}>
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
                    color: 'white'
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
                    color: 'white'
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
                    borderColor: 'white',
                  },
                })}
                type="submit" size="sm" loading={loading}>Create Account</Button>

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
                  borderColor: 'white',
                },
              })}
              onClick={handleGoogleSignUp}
            >
              Sign up with Google
            </Button>

            <Group position="center" spacing="xs" mt="md" style={{ width: '100%' }}>
              <Text size="xs" style={{ flexShrink: 0, color: theme.colors.dark[0] }}>
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
