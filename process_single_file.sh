#!/bin/bash

file=$1

# Skip file if it already has a description
if grep -q -E '^description:' "$file"; then
  echo "Skipping $file, description already exists"
  exit 0
fi

# The file does not have a description.
# Let's extract the first paragraph after the front matter.
description=$(perl -0777 -ne '
  s/---.*?---//s; # remove front matter
  s/#.*//; # remove titles
  s/<.*?>//sg; # remove html tags
  s/\[.*?\]\(.*?\)//sg; # remove markdown links
  s/^\s+//; # remove leading whitespace
  s/\n\n.*//s; # get first paragraph
  s/\n/ /g; # replace newlines with spaces
  s/"/\\"/g; # escape quotes
  s/\s+/ /g; # collapse whitespace
  s/^\s+//; s/\s+$//; # trim leading/trailing whitespace
  print;
' "$file")

# Truncate to 100 words and add ellipsis
description=$(echo "$description" | awk '{for(i=1;i<=100;i++) printf "%s ", $i; if(NF>100) print "..."}')

# remove trailing space if it exists
description=${description% }

# Add the description to the front matter
# Use sed to insert the description after the first `---`
sed -i "2i\\
description: \"$description\"\\
" "$file"

echo "Added description to $file"
