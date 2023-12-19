import React from "react";
import toast from "react-hot-toast";
import { TbCopy } from "react-icons/tb";

type Props = {
  textToCopy: string;
  children: React.ReactNode;
};

type CopyIconProps = {
  className?: string;
};

export const copyToClipboard = async (textToCopy: string) => {
  return await navigator.clipboard.writeText(textToCopy);
};

const Copyable = ({ textToCopy, children }: Props) => {
  const handleCopy = async () => {
    await copyToClipboard(textToCopy).then(() =>
      toast.success("Copied to clipboard!")
    );
  };
  return <div onClick={handleCopy}>{children}</div>;
};

export default Copyable;

Copyable.Icon = function CopyIcon({ className }: CopyIconProps) {
  return <TbCopy className={className} />;
};
