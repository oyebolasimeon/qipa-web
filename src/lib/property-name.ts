export function ocupaiPropertyName(property?: {
  displayName?: string | null;
  internalName?: string | null;
  publicName?: string | null;
  name?: string | null;
} | null) {
  return (
    property?.displayName?.trim() ||
    property?.internalName?.trim() ||
    property?.publicName?.trim() ||
    property?.name?.trim() ||
    "Property"
  );
}
