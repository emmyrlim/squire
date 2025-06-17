import { Form } from "@remix-run/react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Monster } from "../types";

interface BestiaryModalProps {
  monster?: Monster;
  isOpen: boolean;
  onClose: () => void;
}

export function BestiaryModal({
  monster,
  isOpen,
  onClose,
}: BestiaryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{monster ? "Edit Monster" : "Add Monster"}</DialogTitle>
        </DialogHeader>

        <Form method="post" className="space-y-4">
          <FormField
            name="name"
            defaultValue={monster?.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="creature_type"
            defaultValue={monster?.creature_type}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Creature Type</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="armor_class"
              defaultValue={monster?.armor_class}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Armor Class</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="hit_points"
              defaultValue={monster?.hit_points}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hit Points</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="speed"
              defaultValue={monster?.speed}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Speed</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="challenge_rating"
              defaultValue={monster?.challenge_rating}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Challenge Rating</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            name="description"
            defaultValue={monster?.description}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="attacks_observed"
            defaultValue={monster?.attacks_observed}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attacks Observed</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="special_abilities"
            defaultValue={monster?.special_abilities}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Abilities</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="notes"
            defaultValue={monster?.notes}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {monster ? "Save Changes" : "Add Monster"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
