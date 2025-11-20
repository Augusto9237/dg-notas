'use client'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "./ui/button";

import { IoChatbubbleEllipsesOutline } from "react-icons/io5";


interface ModalFeedbackMentoriaProps {
    feedback: string
}


export function ModalFeedbackMentoria({feedback}: ModalFeedbackMentoriaProps) {

    return (
        <Dialog >
            <DialogTrigger asChild disabled={feedback.length === 0 }>
                <Button className="w-full relative bg-primary/10" size="sm" variant='outline'>
                    <IoChatbubbleEllipsesOutline />
                    Feedback do Professor
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
                <DialogHeader>
                    <DialogTitle className="text-center">Feedback</DialogTitle>
                </DialogHeader>

                <p>
                    {feedback}
                </p>
            </DialogContent >
        </Dialog >
    );
}