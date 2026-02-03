"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useSuspenseCredential } from "../hooks/useCredentials";
import { CredentialForm } from "./credentialForm";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

interface CredentialDialogProps {
    credentialId: string;
    onClose: () => void;
}

const CredentialDialogContent = ({ credentialId, onClose }: CredentialDialogProps) => {
    const { data: credential } = useSuspenseCredential(credentialId);

    return <CredentialForm initialData={credential} isDialog onDialogClose={onClose} />;
};

const CredentialDialogLoading = () => {
    return (
        <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
};

export const CredentialDialog = ({ credentialId, onClose }: CredentialDialogProps) => {
    return (
        <Dialog open={!!credentialId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Credential</DialogTitle>
                </DialogHeader>
                <Suspense fallback={<CredentialDialogLoading />}>
                    <CredentialDialogContent credentialId={credentialId} onClose={onClose} />
                </Suspense>
            </DialogContent>
        </Dialog>
    );
};