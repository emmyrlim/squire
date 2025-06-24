-- Allow users to view profiles of users in any shared campaign
CREATE POLICY "Users can view profiles of users in shared campaigns"
ON user_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM campaign_users cu1
    JOIN campaign_users cu2 ON cu1.campaign_id = cu2.campaign_id
    WHERE cu1.user_id = auth.uid()
    AND cu2.user_id = user_profiles.id
  )
  OR id = auth.uid()
);