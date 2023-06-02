import React from "react";
import { useFormik } from "formik";
import { useConnected } from "@/hooks";
import { campaignSchema } from "@/utils/validationSchemas";
import { Button, Input, Typography } from "@web3uikit/core";
import { CreateCampaign } from "@/types";
import { useIsClient } from "usehooks-ts";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useEvmTransaction } from "@moralisweb3/next";

const CreateCampaignForm = () => {
  const isClient = useIsClient();
  useConnected();

  const { fetch } = useEvmTransaction();

  const handleSubmit = (values: CreateCampaign) => {
    console.log(values);
  };

  const formik = useFormik<CreateCampaign>({
    initialValues: {
      title: "",
      description: "",
      deadline: "",
      image: "",
    },
    validationSchema: toFormikValidationSchema(campaignSchema),
    onSubmit: handleSubmit,
  });

  const getInputState = (field: keyof CreateCampaign) =>
    (formik.errors[field]?.length ?? 0) > 0 ? "error" : "initial";

  return (
    <>
      {isClient && (
        <form
          className="w-[500px] flex flex-col gap-8"
          onSubmit={formik.handleSubmit}
        >
          <Typography variant="h2">Create Campaign</Typography>
          <Input
            id="title"
            label="Title"
            name="title"
            onChange={formik.handleChange}
            value={formik.values.title}
            // errorMessage={formik.errors.title}
            // state={getInputState("title")}
          />
          <Button
            text="Create Campaign"
            type="submit"
            size="large"
            theme="outline"
          />
        </form>
      )}
    </>
  );
};

export default CreateCampaignForm;
