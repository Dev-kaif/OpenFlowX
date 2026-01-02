"use client"

import { NodeSelector } from "@/components/reactFlow/nodeSelector";
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { memo, useState } from "react"


export const AddNodeButton = memo(() => {
    const [selectorOpen, setSelectoOpen] = useState(false);


    return (
        <NodeSelector open={selectorOpen} onOpenChange={setSelectoOpen}>
            <Button
                onClick={() => setSelectoOpen(true)}
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