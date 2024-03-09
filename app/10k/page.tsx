"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
import styled from "styled-components";

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

export default function Calculate() {
    const [birthday, setBirthday] = useState("");
    const [result, setResult] = useState("");

    const calculateDate = () => {
        const parsedDate = new Date(birthday);
        const futureDate = addDays(parsedDate, 10000);
        setResult(format(futureDate, "dd MMMM yyyy"));
    };

    return (
        <Container>
            <Title>Calculate 10,000th Day</Title>
            <SubTitle>Because Emily cant code...</SubTitle>
            <Label>
                Enter your birthday:
                <Input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                />
            </Label>
            <Button onClick={calculateDate}>Calculate</Button>
            {result && <Result>Your 10,000th day will be on: {result}</Result>}
        </Container>
    );
}
