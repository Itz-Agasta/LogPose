import { FloatProfilePage } from "@/components/profile/FloatProfilePage";

type ProfilePageParams = {
  params: Promise<{ floatId: string }>;
};

export default async function ProfilePage({ params }: ProfilePageParams) {
  const { floatId } = await params;

  return <FloatProfilePage floatId={floatId} />;
}
