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
} from "@mantine/core";
import { auth, signInWithEmailAndPassword } from "./firebase";  // Import Firebase auth functions

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");  // For displaying errors
    const [loading, setLoading] = useState(false);  // For showing a loading state during login

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);  // Start loading

        try {
            await signInWithEmailAndPassword(auth, email, password);  // Firebase login
            alert("Logged in successfully!");  // On successful login
            // Redirect or perform any other action after successful login (e.g. navigate to dashboard)
        } catch (err) {
            setError(err.message);  // Display error if login fails
        } finally {
            setLoading(false);  // Stop loading
        }
    };

    return (
        <Container size={420} my={40} className="bg-black">

            <Paper withBorder shadow="sm" p={22} mt={30} radius="md" >
                <form onSubmit={handleLogin}>
                    <TextInput
                        placeholder="Email"
                        required
                        radius="md"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <PasswordInput
                        placeholder="Password"
                        required
                        mt="md"
                        radius="md"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <Text color="red" size="sm">{error}</Text>}  {/* Display error if any */}

                    <Group justify="space-between" mt="lg">
                        <Checkbox label="Remember me" />
                        <Anchor component="button" size="sm">
                            Forgot password?
                        </Anchor>
                    </Group>

                    <Button fullWidth mt="xl" radius="md" type="submit" loading={loading}>
                        Sign in
                    </Button>
                    <Text className="text-center">
                        Don't have an account yet? <Anchor>Sign up</Anchor>
                    </Text>
                </form>
            </Paper>

        </Container>
    );
}
