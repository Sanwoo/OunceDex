import { Button } from "@/components/ui/button";
import { filtersProtocolVersions } from "@/lib/protocol-version";
import React from "react";

const ProtocolVersionFilter = ({
  protocolVersions,
  onProtocolVersionChange,
}: {
  protocolVersions: number[];
  onProtocolVersionChange: (version: string, value: number) => void;
}) => {
  return (
    <div className="space-y-1 text-purple-100">
      <h3 className="text-sm font-medium">Protocol version</h3>
      <div className="flex gap-2 flex-wrap">
        {filtersProtocolVersions.map(({ version, value }) => (
          <Button
            key={version}
            variant={protocolVersions.includes(value) ? "default" : "outline"}
            size="sm"
            onClick={() => onProtocolVersionChange(version, value)}
            className={`bg-white/5 hover:bg-white/10 border-purple-300/50 backdrop-blur-md hover:border-purple-400/70 hover:cursor-pointer rounded-lg border transition-all duration-200" ${
              protocolVersions.includes(value)
                ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg hover:shadow-purple-500/25"
                : "text-purple-100"
            }`}
          >
            {version}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ProtocolVersionFilter;
