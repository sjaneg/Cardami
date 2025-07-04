import React, { useState } from "react";
import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Divider,
} from "@mantine/core";
import { auth, signInWithEmailAndPassword } from "../firebase";
import { useMantineTheme } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const db = getFirestore(); // Firebase Firestore instance

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const theme = useMantineTheme();
  const navigate = useNavigate();

  // Handle standard email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDocRef = doc(db, "users", user.uid);

      // Check if the user document exists
      const userDocSnapshot = await getDoc(userDocRef);
      if (!userDocSnapshot.exists()) {
        // Create a new document for the user if it doesn't exist
        await setDoc(userDocRef, {
          cards: [] // Default empty cards array for the user
        });
        console.log("User document created in Firestore!");
      }

      // Redirect to the home page after successful login
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      const userDocRef = doc(db, "users", user.uid);

      // Check if the user document exists
      const userDocSnapshot = await getDoc(userDocRef);
      if (!userDocSnapshot.exists()) {
        // Create a new document for the user if it doesn't exist
        await setDoc(userDocRef, {
          cards: [] // Default empty cards array for the user
        });
        console.log("User document created in Firestore!");
      }

      // Redirect to the home page after successful login
      navigate('/home');
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <>
      <h1 className="absolute top-2 left-4">Cardami</h1>
      <div className="flex flex-col justify-center h-screen w-screen">
        <Container style={{ maxWidth: 400, width: "100%" }}>
          <Title align="center">Login</Title>

          <Paper
            shadow="sm"
            p={22}
            mt="md"
            radius="md"
            style={{ backgroundColor: theme.colors.dark[6] }}
          >
            <form onSubmit={handleLogin}>
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
                    color: "white",
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
                    color: "white",
                  },
                })}
              />

              {error && (
                <Text color="red" size="sm" mt="sm">
                  {error}
                </Text>
              )}

              <Button
                fullWidth
                mt="xl"
                radius="xl"
                styles={(theme) => ({
                  root: {
                    backgroundColor: theme.colors.dark[5],
                    color: "white",
                    borderRadius: 9999,
                    borderColor: "white",
                    "&:hover": {
                      backgroundColor: theme.colors.dark[4],
                    },
                  },
                })}
                type="submit"
                loading={loading}
              >
                Sign in
              </Button>
            </form>

            {/* Divider with OR */}
            <Divider
              label="OR"
              labelPosition="center"
              my="md"
              color={theme.colors.dark[3]}
              styles={{
                label: {
                  fontSize: "1rem",
                  color: theme.colors.dark[0],
                },
              }}
            />

            {/* Sign in with Google */}
            <Button
              fullWidth
              radius="xl"
              styles={(theme) => ({
                root: {
                  backgroundColor: theme.colors.dark[5],
                  color: "white",
                  borderRadius: 9999,
                  borderColor: "white",
                  "&:hover": {
                    backgroundColor: theme.colors.dark[4],
                  },
                },
              })}
              onClick={handleGoogleLogin}
            >
              Sign in with Google
            </Button>

            <Group position="center" spacing="xs" mt="md" style={{ width: "100%" }}>
              <Text size="xs" style={{ flexShrink: 0, color: theme.colors.dark[0] }}>
                Don't have an account yet?
              </Text>
              <Text
                size="xs"
                onClick={() => navigate("/signup")}
                style={{
                  color: "#228be6",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Sign up
              </Text>
            </Group>
          </Paper>
        </Container>
      </div>
    </>
  );
}
