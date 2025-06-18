import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { GqlChain } from "@/lib/generated/graphql";
import { supportedNetworksWithLabels } from "@/lib/networks";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import React from "react";

const NetworkFilter = ({
  networks,
  onNetworkChange,
  onAllNetworksChange,
}: {
  networks: GqlChain[];
  onNetworkChange: (network: GqlChain, checked: boolean) => void;
  onAllNetworksChange: () => void;
}) => {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-medium">Networks</h3>
      <Popover>
        <PopoverTrigger asChild className="flex justify-center">
          <Button className="w-full bg-white/5 hover:bg-white/10 text-purple-100 border-purple-300/50 backdrop-blur-md hover:border-purple-400/70 hover:cursor-pointer px-4 py-2 rounded-lg border transition-all duration-200 font-medium">
            All Supported Networks
            <ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] bg-white/5 border-purple-200/50 backdrop-blur-xl shadow-xl rounded-xl p-3 text-purple-100">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold mb-3">Select Networks</h4>
            <div className="flex items-center space-x-3 hover:bg-purple-100/50 p-2 rounded-md transition-colors hover:cursor-pointer">
              <Checkbox
                id="All Networks"
                checked={!networks[0]}
                onCheckedChange={onAllNetworksChange}
                className="border-purple-400/60 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 rounded-md hover:cursor-pointer"
              />
              <Label
                htmlFor="All Networks"
                className="font-medium flex-1 hover:cursor-pointer"
              >
                All Networks
              </Label>
            </div>
            {supportedNetworksWithLabels.map(({ type, label }) => (
              <div
                key={type}
                className="flex items-center space-x-3 hover:bg-purple-100/50 p-2 rounded-md transition-colors hover:cursor-pointer"
              >
                <Checkbox
                  id={type}
                  checked={networks.includes(type)}
                  onCheckedChange={(checked) =>
                    onNetworkChange(type, !!checked)
                  }
                  className="border-purple-400/60 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 rounded-md hover:cursor-pointer"
                />
                <Label
                  htmlFor={type}
                  className="font-medium flex-1 hover:cursor-pointer"
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default NetworkFilter;
