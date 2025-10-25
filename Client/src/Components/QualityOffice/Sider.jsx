import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus, List } from "lucide-react";
import { Button } from "../ui/button";
import CreateEvaluation from "./CrudEvaluatinForm/CreateEvaluation";
import FetchEvaluation from "./CrudEvaluatinForm/FetchEvaluation";

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
          <span>Forms</span>
          <Plus className="h-4 w-4" />
        </SheetTrigger>
        <SheetContent side="bottom" className="bg-(--one) max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Manage Evaluation Forms</SheetTitle>
            <div className="space-y-4 pt-4">
              <div className="flex gap-4">
                <Button 
                  variant={activeView === 'create' ? 'default' : 'outline'}
                  onClick={() => handleButtonClick('create')}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Form
                </Button>
                <Button 
                  variant={activeView === 'fetch' ? 'default' : 'outline'}
                  onClick={() => handleButtonClick('fetch')}
                  className="flex-1"
                >
                  <List className="h-4 w-4 mr-2" />
                  View Forms
                </Button>
              </div>

              <div className="mt-6">
                {activeView === 'create' && <CreateEvaluation onSuccess={() => setOpen(false)} />}
                {activeView === 'fetch' && <FetchEvaluation />}
              </div>
            </div>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Sider;