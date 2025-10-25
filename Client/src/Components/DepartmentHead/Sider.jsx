import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Plus, List, User2, Users, UserPlus, UserX, UserCog } from "lucide-react";
import { Button } from "../ui/button";

// Import your components
import CreateUser from "./UserCrud/CreateUser";
import FetchUser from "./UserCrud/FetchUser";
import EditUser from "./UserCrud/EditUser";
import DeleteUser from "./UserCrud/DeleteUser";
import ViewEvaluation from "./ViewEvaluation";

const Sider = () => {
  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState('');

  const menuItems = [
    {
      id: 'users',
      title: 'User Management',
      items: [
        {
          id: 'create-user',
          label: 'Create User',
          icon: <UserPlus className="h-4 w-4 mr-2" />,
          component: <CreateUser />
        },
        {
          id: 'view-users',
          label: 'View Users',
          icon: <Users className="h-4 w-4 mr-2" />,
          component: <FetchUser />
        },
   
      ]
    },
    {
      id: 'evaluations',
      title: 'Evaluations',
      items: [
       
        {
          id: 'view-evaluations',
          label: 'View Evaluations',
          icon: <List className="h-4 w-4 mr-2" />,
          component:<ViewEvaluation/>
        }
      ]
    }
  ];

  const handleItemClick = (itemId) => {
    setActiveView(itemId);
  };

  const renderContent = () => {
    if (!activeView) return null;
    
    // Find the active component from menuItems
    for (const section of menuItems) {
      const item = section.items.find(item => item.id === activeView);
      if (item && item.component) {
        return item.component;
      }
    }
    return null;
  };

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="text-[17px] bg-(--four) p-2 rounded-[4px] cursor-pointer m-3 text-(--one) flex items-center gap-2">
          <User2 className="h-5 w-5" />
          <span className="hidden md:inline">Menu</span>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="w-full sm:max-w-7xl bg-white dark:bg-gray-900 overflow-y-auto"
          aria-describedby="sheet-description"
        >
          <SheetDescription id="sheet-description" className="sr-only">
            Navigation menu for department head panel
          </SheetDescription>
          <div className="flex h-full">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
              <SheetHeader className="border-b pb-4">
                <SheetTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Department Head Panel
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-8">
                {menuItems.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {section.title}
                    </h3>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <Button
                          key={item.id}
                          variant={activeView === item.id ? 'secondary' : 'ghost'}
                          onClick={() => handleItemClick(item.id)}
                          className={`w-full justify-start ${activeView === item.id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                        >
                          {item.icon}
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t w-64">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => {
                    // Handle logout
                    console.log('Logout clicked');
                  }}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeView ? (
                <div className="animate-fade-in">
                  {renderContent()}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Select an option from the menu
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Sider;