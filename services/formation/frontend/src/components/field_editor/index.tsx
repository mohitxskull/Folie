import { Accordion, Button, Divider, SimpleGrid, Stack } from "@mantine/core";
import { UseListStateHandlers } from "@mantine/hooks";
import { SwitchOption } from "./switch_option";
import { ListOption } from "./list_option";
import { BaseField } from "./base";
import { NumberOption } from "./number_option";
import { TextOption } from "./text_option";
import { FieldSchema } from "@folie/service-formation-backend/types";
import { Children } from "react";

type Props<T extends FieldSchema = FieldSchema> = {
  fields: T[];
  fieldHandler: UseListStateHandlers<T>;
};

export const FieldEditor = (props: Props) => {
  return (
    <>
      <Stack>
        {Children.toArray(
          props.fields.map((field, fieldIndex) => {
            if (field.deleted) {
              return null;
            }

            const setDirect = (obj: typeof field) => {
              console.log({ obj, fieldIndex });
              props.fieldHandler.setItem(fieldIndex, obj);
            };

            const remove = () => {
              if (field.key) {
                setDirect({
                  ...field,
                  deleted: true,
                });
              } else {
                props.fieldHandler.remove(fieldIndex);
              }
            };

            switch (field.type) {
              case "string":
                return (
                  <>
                    <BaseField
                      field={field}
                      fields={props.fields}
                      remove={remove}
                      onChange={setDirect}
                    >
                      <SimpleGrid cols={2}>
                        <SwitchOption
                          label="Required"
                          path="options.required"
                          value={field}
                          onChange={setDirect}
                        />

                        <SwitchOption
                          label="Nullable"
                          path="options.nullable"
                          value={field}
                          onChange={setDirect}
                        />
                      </SimpleGrid>

                      <Accordion>
                        <Accordion.Item value="advance">
                          <Accordion.Control>Advance</Accordion.Control>
                          <Accordion.Panel>
                            <Stack>
                              <SimpleGrid cols={2}>
                                <NumberOption
                                  label="Min Length"
                                  path="options.minLength"
                                  value={field}
                                  onChange={setDirect}
                                />

                                <NumberOption
                                  label="Max Length"
                                  path="options.maxLength"
                                  value={field}
                                  onChange={setDirect}
                                />
                              </SimpleGrid>

                              {(() => {
                                switch (field.sub.type) {
                                  case "email":
                                    return (
                                      <>
                                        <Divider
                                          label="Email"
                                          labelPosition="left"
                                        />

                                        <SimpleGrid cols={2}>
                                          <SwitchOption
                                            label="Allow Display Name"
                                            description="Enabled by default, will also match `Display Name <email-address>`"
                                            default={true}
                                            path="sub.options.allow_display_name"
                                            value={field}
                                            onChange={setDirect}
                                          />

                                          <SwitchOption
                                            label="Require Display Name"
                                            description="Disabled by default, will reject strings without the format `Display Name <email-address>`"
                                            path="sub.options.require_display_name"
                                            value={field}
                                            onChange={setDirect}
                                          />

                                          <SwitchOption
                                            label="Allow UTF8 Local Part"
                                            description="Disabled by default, will not allow any non-English UTF8 character in email address' local part"
                                            path="sub.options.allow_utf8_local_part"
                                            value={field}
                                            onChange={setDirect}
                                          />

                                          <SwitchOption
                                            label="Require TLD"
                                            description="Disabled by default, e-mail addresses without having TLD in their domain will also be matched"
                                            path="sub.options.require_tld"
                                            value={field}
                                            onChange={setDirect}
                                          />

                                          <SwitchOption
                                            label="Ignore max length"
                                            description="Disabled by default, will not check for the standard max length of an email"
                                            path="sub.options.ignore_max_length"
                                            value={field}
                                            onChange={setDirect}
                                          />

                                          <SwitchOption
                                            label="Allow IP domain"
                                            description="Disabled by default, will allow IP addresses in the host part"
                                            path="sub.options.allow_ip_domain"
                                            value={field}
                                            onChange={setDirect}
                                          />

                                          <SwitchOption
                                            label="Domain specific validation"
                                            description="Disabled by default, some additional validation will be enabled, e.g. disallowing certain syntactically valid email addresses that are rejected by GMail"
                                            path="sub.options.domain_specific_validation"
                                            value={field}
                                            onChange={setDirect}
                                          />

                                          <SwitchOption
                                            label="Allow underscores"
                                            description="Disabled by default, will allow underscores in an email address"
                                            path="sub.options.allow_underscores"
                                            value={field}
                                            onChange={setDirect}
                                          />
                                        </SimpleGrid>

                                        <TextOption
                                          label="Blacklisted chars"
                                          description="will reject emails that include any of the characters in the string, in the name part"
                                          path="sub.options.blacklisted_chars"
                                          placeholder="e.g. @#$%^&*()_+"
                                          value={field}
                                          onChange={setDirect}
                                        />

                                        <ListOption
                                          label="Host Blacklist"
                                          description="If the email after the @ symbol matches any of the strings in the list it will be rejected"
                                          value={field}
                                          path="sub.options.host_blacklist"
                                          onChange={setDirect}
                                        />

                                        <ListOption
                                          label="Host Whitelist"
                                          description="If the email after the @ symbol did not match any of the strings in the list it will be rejected"
                                          value={field}
                                          path="sub.options.host_whitelist"
                                          onChange={setDirect}
                                        />
                                      </>
                                    );

                                  case "url":
                                    return (
                                      <>
                                        <Divider
                                          label="URL"
                                          labelPosition="left"
                                        />

                                        <SimpleGrid cols={2}>
                                          <SwitchOption
                                            label="Require protocol"
                                            description="Disabled by default, will reject URLs without a protocol"
                                            path="sub.options.require_protocol"
                                            value={field}
                                            onChange={setDirect}
                                          />
                                        </SimpleGrid>
                                      </>
                                    );
                                }
                              })()}
                            </Stack>
                          </Accordion.Panel>
                        </Accordion.Item>
                      </Accordion>
                    </BaseField>
                  </>
                );

              case "number":
                return (
                  <>
                    <BaseField
                      field={field}
                      fields={props.fields}
                      remove={remove}
                      onChange={setDirect}
                    >
                      <SimpleGrid cols={2}>
                        <SwitchOption
                          label="Required"
                          path="options.required"
                          value={field}
                          onChange={setDirect}
                        />

                        <SwitchOption
                          label="Nullable"
                          path="options.nullable"
                          value={field}
                          onChange={setDirect}
                        />
                      </SimpleGrid>

                      <Accordion>
                        <Accordion.Item value="advance">
                          <Accordion.Control>Advance</Accordion.Control>
                          <Accordion.Panel>
                            <Stack>
                              <SimpleGrid cols={2}>
                                <NumberOption
                                  label="Min"
                                  path="options.min"
                                  value={field}
                                  onChange={setDirect}
                                />

                                <NumberOption
                                  label="Max Length"
                                  path="options.max"
                                  value={field}
                                  onChange={setDirect}
                                />
                              </SimpleGrid>

                              <SimpleGrid cols={2}>
                                <SwitchOption
                                  label="Force Negative"
                                  description="Disabled by default, will only allow negative numbers"
                                  path="options.negative"
                                  value={field}
                                  onChange={setDirect}
                                />

                                <SwitchOption
                                  label="Force Positive"
                                  description="Disabled by default, will only allow positive numbers"
                                  path="options.positive"
                                  value={field}
                                  onChange={setDirect}
                                />
                              </SimpleGrid>
                            </Stack>
                          </Accordion.Panel>
                        </Accordion.Item>
                      </Accordion>
                    </BaseField>
                  </>
                );

              default:
                return <>Unknown</>;
            }
          }),
        )}

        <Button
          onClick={() => {
            props.fieldHandler.append({
              type: "string",
              name: "",
              sub: {
                type: "none",
              },
            });
          }}
        >
          Add Field
        </Button>
      </Stack>
    </>
  );
};
