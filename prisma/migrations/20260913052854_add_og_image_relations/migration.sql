-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_ogImageId_fkey" FOREIGN KEY ("ogImageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_ogImageId_fkey" FOREIGN KEY ("ogImageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
