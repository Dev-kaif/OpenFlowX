"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { memo } from "react"


export const AddNodeButton = memo(() => {
    return (
        <Button
            onClick={() => { }}
            size={"sm"}
            variant={"outline"}
            className="bg-background"
        >
            <PlusIcon />
        </Button>
    )
});

AddNodeButton.displayName = "AddNodeButton"