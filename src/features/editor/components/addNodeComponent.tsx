"use client"

import { NodeSelector } from "@/components/reactFlow/nodeSelector";
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { memo, useState } from "react"


export const AddNodeButton = memo(() => {
    const [open, setOpen] = useState(false);

    return (
        <NodeSelector open={open} onOpenChange={setOpen}>
            <Button
                onClick={() => { }}
                size={"sm"}
                variant={"outline"}
                className="bg-background"
                >
                <PlusIcon />
            </Button>
        </NodeSelector>
    )
});

AddNodeButton.displayName = "AddNodeButton"