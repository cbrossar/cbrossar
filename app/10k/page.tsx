"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import styled from "styled-components";

export default function Calculate() {
    const router = useRouter();
    const { birthday: urlBirthday } = useSearchParams() as any;;
    const [birthday, setBirthday] = useState(urlBirthday ?? "");
    const [result, setResult] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (urlBirthday) {
            calculateDate(urlBirthday);
        }
    }, [urlBirthday]);

    const calculateDate = (birthday: string) => {
        if (!birthday) {
            setError("Please enter a valid date");
            setResult("");
            return;
        }

        const [year, month, day] = birthday.split("-").map(Number);
        const parsedDate = new Date(year, month - 1, day);
        const futureDate = addDays(parsedDate, 10000);
        setResult(format(futureDate, "dd MMMM yyyy"));
        setError("");
    };

    const handleCalculate = () => {
        calculateDate(birthday);
        router.push(`?birthday=${birthday}`);
    };

    return (
        <Container>
            <Title>Calculate 10,000th Day</Title>
            <SubTitle>Because Emily can&apos;t code...</SubTitle>
            <Label>
                Enter your birthday:
                <Input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                />
            </Label>

            <Button onClick={handleCalculate}>Calculate</Button>
            {error && <ErrorText>{error}</ErrorText>}
            {result && <Result>Your 10,000th day will be on: {result}</Result>}
        </Container>
    );
}

const Container = styled.div`
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
`;

const Title = styled.h1`
    font-size: 24px;
    margin-bottom: 20px;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 10px;
`;

const Input = styled.input`
    padding: 5px;
    width: 100%;
    border-radius: 3px;
    border: 1px solid #ccc;
`;

const Button = styled.button`
    padding: 8px 16px;
    background-color: #0070f3;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 10px;
`;

const Result = styled.p`
    margin-top: 20px;
`;

const SubTitle = styled.p`
    margin-bottom: 20px;
`;

const ErrorText = styled.p`
    color: red;
    font-weight: bold;
`;
