import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus, List, Hamburger, Menu } from "lucide-react";
import { Button } from "../ui/button";
import History from "./History";

const Sider = () => {
  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState(null);

  const handleButtonClick = (view) => {
    setActiveView(view);
  };

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="text-[17px] bg-(--four) p-2 rounded-[4px] cursor-pointer m-3 text-(--one) flex items-center gap-2">
         <Menu/>
        </SheetTrigger>
        <SheetContent side="bottom" className="bg-(--one) max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
           <p>EVALUATIONS</p>
            </SheetTitle>
           
          </SheetHeader>
          <History/>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Sider;