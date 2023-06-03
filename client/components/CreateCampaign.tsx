import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useFormik } from "formik";
import { useIsClient } from "usehooks-ts";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { polygonMumbai } from "wagmi/chains";

import {
  Button,
  Input,
  TextArea,
  Typography,
  DatePicker,
  useNotification,
} from "@web3uikit/core";
import { Container } from "./Container";

import { useConnected, useCreateCampaign } from "@/hooks";
import { campaignSchema } from "@/utils/validationSchemas";
import { getMinMaxDeadline } from "@/utils/date";
import { checkImageExists } from "@/utils/image";
import { CreateCampaign, CreateCampaignForm } from "@/types";
import { abi, contractAddress } from "@/constants";
import { useRouter } from "next/router";

const imageValidation = z
  .string({ required_error: "Image url is required field" })
  .nonempty("You must provide image url")
  .url("Provide correct image url")
  .refine(
    (value) => {
      return /^(http|https):\/\//.test(value);
    },
    { message: "Provide correct image url" }
  );

const CreateCampaignForm = () => {
  useConnected();
  const isClient = useIsClient();
  const router = useRouter();

  const [preview, setPreview] = useState("");
  const [formikValues, setFormikValues] = useState<null | CreateCampaign>(null);

  const dispatch = useNotification();

  const { write, isLoading } = useContractWrite({
    address: contractAddress,
    abi,
    chainId: polygonMumbai.id,
    args: [
      formikValues?.title,
      formikValues?.description,
      formikValues?.image,
      formikValues?.deadline,
    ],
    functionName: "createCampaign",
    onSuccess: () => {
      dispatch({
        type: "success",
        title: "Campaign Creation",
        message: "Campaign was successfuly created",
        position: "topR",
      });
      router.push("/");
    },
    onError: (err) => {
      console.error(err);
      dispatch({
        type: "error",
        title: "Campaign Creation",
        message: "Failed to create the campaign",
        position: "topR",
      });
    },
  });

  const handleSubmit = useCallback(() => {
    if (!isClient || !write || !formikValues) return;

    write();
  }, [formikValues, isClient, write]);

  const formik = useFormik<CreateCampaignForm>({
    initialValues: {
      title: "",
      description: "",
      deadline: new Date(),
      image: "",
    },
    validationSchema: toFormikValidationSchema(campaignSchema),
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    setFormikValues({
      ...formik.values,
      deadline: Math.floor(formik.values.deadline.getTime() / 1000),
    });
  }, [formik.values]);

  const isValidationError = useCallback(
    (field: keyof CreateCampaign) => {
      return formik.touched[field] && formik.errors[field];
    },
    [formik.errors, formik.touched]
  );

  const getInputState = useCallback(
    (field: keyof CreateCampaign) => {
      return isValidationError(field) ? "error" : "initial";
    },
    [isValidationError]
  );

  const getTextareaState = useCallback(
    (field: keyof CreateCampaign) => {
      if (isLoading) return "disabled";

      return isValidationError(field) ? "error" : undefined;
    },
    [isLoading, isValidationError]
  );

  const showError = useCallback(
    (field: keyof CreateCampaign) => {
      return (
        <div className="min-h-[24px] h-fit">
          {isValidationError(field) && (
            <Typography variant="caption12" color="rgb(233, 85, 87)">
              {formik.errors[field]}
            </Typography>
          )}
        </div>
      );
    },
    [formik.errors, isValidationError]
  );

  const handleDateChange = useCallback(
    ({ date }: { date: Date }) => {
      const deadline = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      formik.setFieldValue("deadline", deadline);
    },
    [formik]
  );

  const handleImageChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const url = event.target.value;
      formik.setFieldValue("image", url);

      if (url !== preview) {
        setPreview("");
      }

      const validationResult = imageValidation.safeParse(url);

      if (!validationResult.success) return;

      const imageExists = await checkImageExists(url);

      if (!imageExists) {
        return;
      }

      setPreview(url);
    },
    [formik, preview]
  );

  return (
    <Container>
      {isClient && (
        <form
          className="w-[450px] flex flex-col gap-8"
          onSubmit={formik.handleSubmit}
        >
          <Typography variant="h2">Create Campaign</Typography>
          <Input
            id="title"
            label="Title"
            name="title"
            state={getInputState("title")}
            value={formik.values.title}
            errorMessage={formik.errors.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            width="100%"
            disabled={isLoading}
          />
          <div className="flex flex-col gap-1">
            <TextArea
              id="description"
              label="Description"
              name="description"
              state={getTextareaState("description")}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              width="100%"
            />
            {showError("description")}
          </div>
          <div className="flex flex-col gap-1">
            <DatePicker
              id="deadline"
              label="Deadline"
              name="deadline"
              state={getInputState("deadline")}
              value={formik.values.description}
              onChange={handleDateChange}
              type="date"
              validation={{
                min: getMinMaxDeadline().minDateString,
                max: getMinMaxDeadline().maxDateString,
              }}
              disabled={isLoading}
            />
            {showError("deadline")}
          </div>
          <div className="w-full flex flex-col items-center gap-8">
            <Input
              id="image"
              label="Image"
              name="image"
              state={getInputState("image")}
              value={formik.values.image}
              errorMessage={formik.errors.image}
              onChange={handleImageChange}
              onBlur={formik.handleBlur}
              width="100%"
              disabled={isLoading}
            />
            <Image
              src={preview || " "}
              alt="preview"
              width="0"
              height="0"
              sizes="100vw"
              className="w-40 h-40 object-cover rounded-sm"
              unoptimized
            />
          </div>
          <Button
            text="Create Campaign"
            type="submit"
            size="large"
            theme="outline"
            disabled={isLoading}
          />
        </form>
      )}
    </Container>
  );
};

export default CreateCampaignForm;
