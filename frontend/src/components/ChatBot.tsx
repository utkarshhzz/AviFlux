import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BotMessageSquare } from "lucide-react";
import { Sparkles } from "lucide-react";

interface Message {
    id: number;
    sender: "user" | "ai";
    text: string;
}

const sampleMessages: Message[] = [
    { id: 1, sender: "ai", text: "Hello! How can I help you today?" },
];

export function AIChatbot({ floating = true }: { floating?: boolean }) {
    const [messages, setMessages] = useState<Message[]>(sampleMessages);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(!floating); // auto open if not floating
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleSend = () => {
        if (!input.trim()) return;
        const newMsg: Message = {
            id: messages.length + 1,
            sender: "user",
            text: input.trim(),
        };
        setMessages([...messages, newMsg]);
        setInput("");

        // Simulate AI response
        setTimeout(() => {
            const aiMsg: Message = {
                id: messages.length + 2,
                sender: "ai",
                text: "Sample AI response: " + newMsg.text,
            };
            setMessages((prev) => [...prev, aiMsg]);
        }, 800);
    };

    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages, isOpen]);

    const ChatUI = (
        <Card
            className={`
    flex flex-col shadow-xl
    ${floating ? "w-[320px] h-[400px]" : "w-full max-w-lg h-full"}
  `}
        >
            <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-2xl">
                    <div className="inline-block relative">
                        <span
                            className={`absolute inset-0  w-8 h-8 rounded-full blur-lg bg-blue-400  opacity-30 pulse 1s animate-pulse`}
                        ></span>
                        <Sparkles className="text-blue-400 w-8 h-8 animate-pulse rotate-[-30deg]" />
                    </div>
                    AI Chat{" "}
                </CardTitle>
                {floating && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                    >
                        ✕
                    </Button>
                )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-2">
                <ScrollArea ref={scrollRef} className="flex-1 mb-2">
                    <div className="flex flex-col gap-2">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${
                                    msg.sender === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`flex items-start gap-2 ${
                                        msg.sender === "ai"
                                            ? "flex-row"
                                            : "flex-row-reverse"
                                    }`}
                                >
                                    <Avatar>
                                        <AvatarFallback>
                                            {msg.sender === "ai" ? "AI" : "You"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div
                                        className={`px-3 py-1.5 rounded-xl max-w-[220px] break-words ${
                                            msg.sender === "ai"
                                                ? "bg-gray-100 text-gray-900"
                                                : "bg-blue-500 text-white"
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="flex gap-2">
                    <Input
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <Button onClick={handleSend}>Send</Button>
                </div>
            </CardContent>
        </Card>
    );

    if (!floating) {
        // Normal inline chat
        return ChatUI;
    }

    // Floating mode
    return (
        <div className="fixed bottom-18 right-4 z-50">
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="rounded-full w-14 h-14"
                >
                    <BotMessageSquare />
                </Button>
            )}
            {isOpen && ChatUI}
        </div>
    );
}
